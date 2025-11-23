import type {
	AddressList,
	EmailAddress,
	EmailEnvelope,
	EmailResponse,
	EmailService,
} from '../types';

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

export type SendgridOptions = {
	apiKey: string;
	defaultFrom: EmailAddress;
};

type SGAddress = { email: string; name?: string };

const toArray = (input?: AddressList): SGAddress[] | undefined => {
	if (!input) return undefined;
	const make = (value: EmailAddress): SGAddress => {
		if (typeof value === 'string') {
			return { email: value };
		}
		return { email: value.email, name: value.name };
	};

	return Array.isArray(input) ? input.map(make) : [make(input)];
};

const ensureContent = (envelope: EmailEnvelope) => {
	const content = [];
	if (envelope.textBody) {
		content.push({ type: 'text/plain', value: envelope.textBody });
	}
	if (envelope.htmlBody) {
		content.push({ type: 'text/html', value: envelope.htmlBody });
	}

	if (!content.length) {
		content.push({ type: 'text/plain', value: '' });
	}

	return content;
};

const formatAddress = (address?: EmailAddress): SGAddress | undefined => {
	if (!address) return undefined;
	return typeof address === 'string'
		? { email: address }
		: { email: address.email, name: address.name };
};

export const createSendgridEmailService = (options: SendgridOptions): EmailService => {
	const { apiKey, defaultFrom } = options;

	if (!apiKey) {
		throw new Error('Missing SENDGRID_API_KEY');
	}

	if (!defaultFrom) {
		throw new Error('Missing EMAIL_FROM for SendGrid provider');
	}

	return {
		async send(envelope: EmailEnvelope): Promise<EmailResponse> {
			const personalizations = [
				{
					to: toArray(envelope.to),
					cc: toArray(envelope.cc),
					bcc: toArray(envelope.bcc),
					subject: envelope.subject,
					headers: envelope.headers,
					custom_args: envelope.metadata,
					categories: envelope.tags,
				},
			];

			if (!personalizations[0].to?.length) {
				throw new Error('SendGrid envelope requires at least one "to" recipient');
			}

			const body = {
				personalizations,
				from: formatAddress(envelope.from ?? defaultFrom),
				reply_to: formatAddress(envelope.replyTo ?? defaultFrom),
				content: ensureContent(envelope),
			};

			const response = await fetch(SENDGRID_API_URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				let errorDetail: unknown;
				try {
					errorDetail = await response.json();
				} catch {
					errorDetail = await response.text();
				}
				throw new Error(
					`SendGrid request failed (${response.status}): ${JSON.stringify(errorDetail)}`
				);
			}

			return {
				providerId: 'sendgrid',
				messageId: response.headers.get('x-message-id') ?? undefined,
			};
		},
	};
};


