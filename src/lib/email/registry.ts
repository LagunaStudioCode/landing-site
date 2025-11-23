import { createConsoleEmailService } from './providers/console';
import { createSendgridEmailService } from './providers/sendgrid';
import type { EmailProviderFactory, EmailProviderId, EmailService } from './types';

type RuntimeEnv = Record<string, string | undefined>;

const runtimeEnv = (import.meta.env ?? {}) as RuntimeEnv;

const getEnvVar = (key: string, optional = false): string => {
	const value = runtimeEnv[key];
	if (!value && !optional) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value ?? '';
};

const factories: Partial<Record<EmailProviderId, EmailProviderFactory>> = {
	console: () => createConsoleEmailService(),
	sendgrid: () =>
		createSendgridEmailService({
			apiKey: getEnvVar('SENDGRID_API_KEY'),
			defaultFrom: getEnvVar('EMAIL_FROM'),
		}),
};

let cachedService: EmailService | null = null;

const resolveProviderId = (override?: EmailProviderId): EmailProviderId => {
	if (override) return override;
	const provider = (runtimeEnv.EMAIL_PROVIDER ?? 'console').toLowerCase() as EmailProviderId;
	return provider;
};

export const getEmailService = (override?: EmailProviderId): EmailService => {
	if (!override && cachedService) return cachedService;

	const providerId = resolveProviderId(override);
	const factory = factories[providerId];

	if (!factory) {
		throw new Error(
			`Email provider "${providerId}" is not configured. Add a provider factory in src/lib/email/registry.ts.`
		);
	}

	const instance = factory();
	if (!override) {
		cachedService = instance;
	}

	return instance;
};


