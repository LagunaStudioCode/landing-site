import type { ExecutionContext, IncomingRequestCfProperties } from '@cloudflare/workers-types';

type RuntimeFactory = (platform?: string) => unknown;

type RuntimeSource = {
	env?: Record<string, unknown>;
	cf?: IncomingRequestCfProperties;
	ctx?: Pick<ExecutionContext, 'waitUntil' | 'passThroughOnException'>;
	request?: Request & { cf?: IncomingRequestCfProperties };
};

type LocalsWithRuntime = {
	runtime?: RuntimeFactory;
};

export type CloudflareRuntime = {
	env: Record<string, unknown>;
	cf?: IncomingRequestCfProperties;
	ctx: Pick<ExecutionContext, 'waitUntil' | 'passThroughOnException'>;
	request: Request & { cf?: IncomingRequestCfProperties };
};

export type CloudflareRequestMeta = {
	rayId?: string;
	requestId?: string;
	colo?: string;
	country?: string;
	region?: string;
	city?: string;
	clientIp?: string;
	asn?: number;
	userAgent?: string | null;
};

const fallbackCtx: Pick<ExecutionContext, 'waitUntil' | 'passThroughOnException'> = {
	waitUntil: (promise) => {
		Promise.resolve(promise).catch((error) => {
			console.error('[runtime:cloudflare] waitUntil task rejected', error);
		});
	},
	passThroughOnException: () => {},
};

const toRuntimeSource = (locals?: LocalsWithRuntime): RuntimeSource | undefined => {
	if (!locals || typeof locals.runtime !== 'function') return undefined;
	const runtime = locals.runtime('cloudflare');
	if (!runtime || typeof runtime !== 'object') return undefined;
	return runtime as RuntimeSource;
};

const toRequest = (
	source: RuntimeSource | undefined,
	request: Request,
): Request & { cf?: IncomingRequestCfProperties } => {
	if (source?.request) return source.request;
	return request as Request & { cf?: IncomingRequestCfProperties };
};

const toCf = (
	source: RuntimeSource | undefined,
	request: Request & { cf?: IncomingRequestCfProperties },
): IncomingRequestCfProperties | undefined => {
	if (source?.cf) return source.cf;
	return request.cf;
};

export const getCloudflareRuntime = (
	context: { locals?: LocalsWithRuntime } & { request: Request },
): CloudflareRuntime | null => {
	const runtimeSource = toRuntimeSource(context.locals);
	const request = toRequest(runtimeSource, context.request);

	if (!runtimeSource) {
		return null;
	}

	return {
		env: runtimeSource.env ?? (import.meta.env as Record<string, unknown>),
		cf: toCf(runtimeSource, request),
		ctx: runtimeSource.ctx ?? fallbackCtx,
		request,
	};
};

export const getRequestMeta = (runtime: CloudflareRuntime | null): CloudflareRequestMeta => {
	if (!runtime) {
		return {};
	}

	const cf = runtime.cf;
	const headers = runtime.request.headers;

	return {
		rayId: headers.get('cf-ray') ?? undefined,
		requestId: headers.get('request-id') ?? undefined,
		colo: cf?.colo,
		country: cf?.country,
		region: cf?.region,
		city: cf?.city,
		clientIp: headers.get('cf-connecting-ip') ?? headers.get('x-real-ip') ?? undefined,
		asn: cf?.asn,
		userAgent: headers.get('user-agent'),
	};
};


