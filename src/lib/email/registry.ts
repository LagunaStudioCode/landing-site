import { createConsoleEmailService } from './providers/console';
import { createSendgridEmailService } from './providers/sendgrid';
import { createZeptoMailEmailService } from './providers/zeptomail';
import type { EmailProviderId, EmailService } from './types';

export type RuntimeEnv = Record<string, string | undefined>;

const defaultEnv = (import.meta.env ?? {}) as RuntimeEnv;

const getEnvVar = (env: RuntimeEnv, key: string, optional = false): string => {
	const value = env[key];
	if (!value && !optional) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value ?? '';
};

const buildConsoleService = () => createConsoleEmailService();

const buildSendgridService = (env: RuntimeEnv) =>
	createSendgridEmailService({
		apiKey: getEnvVar(env, 'SENDGRID_API_KEY'),
		defaultFrom: getEnvVar(env, 'EMAIL_FROM'),
	});

const buildZeptoMailService = (env: RuntimeEnv) =>
	createZeptoMailEmailService({
		token: getEnvVar(env, 'ZEPTOMAIL_TOKEN'),
		defaultFrom: getEnvVar(env, 'EMAIL_FROM'),
		url: getEnvVar(env, 'ZEPTOMAIL_URL', true) || undefined,
		// Optional explicit bounce address; if omitted, the provider will
		// fall back to the default "from" address.
		bounceAddress: getEnvVar(env, 'ZEPTOMAIL_BOUNCE_ADDRESS', true) || undefined,
	});

const createService = (providerId: EmailProviderId, env: RuntimeEnv): EmailService => {
	switch (providerId) {
		case 'console':
			return buildConsoleService();
		case 'sendgrid':
			return buildSendgridService(env);
		case 'zeptomail':
			return buildZeptoMailService(env);
		default:
			throw new Error(
				`Email provider "${providerId}" is not configured. Add a provider factory in src/lib/email/registry.ts.`
			);
	}
};

const resolveProviderId = (env: RuntimeEnv, override?: EmailProviderId): EmailProviderId => {
	if (override) return override;
	const provider = (env.EMAIL_PROVIDER ?? 'console').toLowerCase() as EmailProviderId;
	return provider;
};

let cachedService: EmailService | null = null;

export const getEmailService = (options?: {
	env?: RuntimeEnv;
	override?: EmailProviderId;
	useCache?: boolean;
}): EmailService => {
	const env = options?.env ?? defaultEnv;
	const providerId = resolveProviderId(env, options?.override);
	const shouldCache = !options?.env && !options?.override && options?.useCache !== false;

	if (shouldCache && cachedService) {
		return cachedService;
	}

	const instance = createService(providerId, env);

	if (shouldCache) {
		cachedService = instance;
	}

	return instance;
};


