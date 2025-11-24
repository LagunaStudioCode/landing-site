/// <reference types="astro/client" />

type EmailProvider = 'console' | 'sendgrid' | 'zeptomail';

interface ImportMetaEnv {
	readonly EMAIL_FROM?: string;
	readonly EMAIL_CONFIRMATION_FROM?: string;
	readonly EMAIL_COMPANY_INBOX?: string;
	readonly EMAIL_BCC?: string;
	readonly EMAIL_PROVIDER?: EmailProvider;
	readonly SENDGRID_API_KEY?: string;
	readonly ZEPTOMAIL_TOKEN?: string;
	readonly ZEPTOMAIL_URL?: string;
	readonly ZEPTOMAIL_BOUNCE_ADDRESS?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace App {
	interface Locals {
		runtime?<T = unknown>(platform?: string): T | undefined;
	}
}


