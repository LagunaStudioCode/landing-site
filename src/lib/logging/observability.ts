import type { CloudflareRequestMeta, CloudflareRuntime } from '../runtime/cloudflare';

type ObservabilityBinding =
	| {
			writeDataPoint: (data: {
				indexes?: string[];
				doubles?: number[];
				blobs?: string[];
			}) => Promise<void> | void;
	  }
	| {
			log: (payload: unknown) => Promise<void> | void;
	  };

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type ObservabilityLogInput = {
	level?: LogLevel;
	action: string;
	message: string;
	rayId?: string;
	requestId?: string;
	meta?: Record<string, unknown>;
	error?: unknown;
};

const serializeError = (error: unknown) => {
	if (!error) return undefined;
	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
		};
	}

	if (typeof error === 'object') {
		return error;
	}

	return { value: error };
};

const getObservabilityBinding = (runtime: CloudflareRuntime | null): ObservabilityBinding | undefined => {
	const binding = runtime?.env?.OBSERVABILITY;
	if (!binding || typeof binding !== 'object') return undefined;

	if ('log' in binding && typeof binding.log === 'function') {
		return binding as ObservabilityBinding;
	}

	if ('writeDataPoint' in binding && typeof binding.writeDataPoint === 'function') {
		return binding as ObservabilityBinding;
	}

	return undefined;
};

const dispatchToBinding = async (binding: ObservabilityBinding | undefined, payload: Record<string, unknown>) => {
	if (!binding) return;

	try {
		if ('log' in binding && typeof binding.log === 'function') {
			await binding.log(payload);
			return;
		}

		if ('writeDataPoint' in binding && typeof binding.writeDataPoint === 'function') {
			const blob = JSON.stringify(payload);
			await binding.writeDataPoint({
				indexes: [
					String(payload.level ?? 'info'),
					String(payload.action ?? 'unknown'),
					String(payload.rayId ?? payload.requestId ?? 'n/a'),
				],
				blobs: [blob],
			});
		}
	} catch (error) {
		console.error('[observability] failed to write payload', error, payload);
	}
};

const logToConsole = (payload: Record<string, unknown>) => {
	const level = (payload.level as LogLevel | undefined) ?? 'info';
	const namespace = `[observability:${String(payload.action ?? 'unknown')}]`;

	switch (level) {
		case 'error':
			console.error(namespace, payload.message, payload);
			break;
		case 'warn':
			console.warn(namespace, payload.message, payload);
			break;
		case 'debug':
			console.debug(namespace, payload.message, payload);
			break;
		default:
			console.info(namespace, payload.message, payload);
	}
};

export const createObservabilityLogger = (options: {
	runtime: CloudflareRuntime | null;
	requestMeta?: CloudflareRequestMeta;
	defaultAction?: string;
}) => {
	const { runtime, requestMeta, defaultAction = 'unknown' } = options;
	const binding = getObservabilityBinding(runtime);

	const emit = (input: ObservabilityLogInput) => {
		const payload = {
			level: input.level ?? 'info',
			action: input.action || defaultAction,
			message: input.message,
			rayId: input.rayId ?? requestMeta?.rayId,
			requestId: input.requestId ?? requestMeta?.requestId,
			colo: requestMeta?.colo,
			country: requestMeta?.country,
			region: requestMeta?.region,
			city: requestMeta?.city,
			clientIp: requestMeta?.clientIp,
			asn: requestMeta?.asn,
			meta: input.meta,
			error: serializeError(input.error),
			timestamp: new Date().toISOString(),
		} satisfies Record<string, unknown>;

		const task = binding
			? dispatchToBinding(binding, payload)
			: Promise.resolve(logToConsole(payload));

		if (runtime?.ctx) {
			runtime.ctx.waitUntil(task);
		}

		return task;
	};

	return {
		info: (message: string, meta?: Record<string, unknown>) =>
			emit({ level: 'info', action: defaultAction, message, meta }),
		debug: (message: string, meta?: Record<string, unknown>) =>
			emit({ level: 'debug', action: defaultAction, message, meta }),
		warn: (message: string, meta?: Record<string, unknown>) =>
			emit({ level: 'warn', action: defaultAction, message, meta }),
		error: (message: string, error?: unknown, meta?: Record<string, unknown>) =>
			emit({ level: 'error', action: defaultAction, message, error, meta }),
		withAction: (action: string) =>
			createObservabilityLogger({
				runtime,
				requestMeta,
				defaultAction: action,
			}),
	};
};


