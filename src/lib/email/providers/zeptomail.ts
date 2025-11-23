import type {
	AddressList,
	EmailAddress,
	EmailEnvelope,
	EmailResponse,
	EmailService,
} from '../types';

export type ZeptoMailOptions = {
	token: string;
	defaultFrom: EmailAddress;
	url?: string;
	bounceAddress?: string;
};

type ZeptoRecipient = {
	email_address: {
		address: string;
		name?: string;
	};
};

const DEFAULT_ZEPTOMAIL_URL = 'https://api.zeptomail.com/v1.1/email';

const toMailbox = (address: EmailAddress): { address: string; name?: string } => {
	if (typeof address === 'string') {
		return { address };
	}
	return { address: address.email, name: address.name };
};

const toRecipient = (address: EmailAddress): ZeptoRecipient => ({
	email_address: toMailbox(address),
});

const toRecipientList = (list?: AddressList): ZeptoRecipient[] | undefined => {
	if (!list) return undefined;
	return Array.isArray(list) ? list.map(toRecipient) : [toRecipient(list)];
};

const ensureBody = (envelope: EmailEnvelope) => {
	const payload: Record<string, unknown> = {};

	if (envelope.htmlBody) {
		payload.htmlbody = envelope.htmlBody;
	}

	if (envelope.textBody) {
		payload.textbody = envelope.textBody;
	}

	// ZeptoMail requires at least one of textbody/htmlbody; fall back to empty text body.
	if (!payload.htmlbody && !payload.textbody) {
		payload.textbody = '';
	}

	return payload;
};

export const createZeptoMailEmailService = (options: ZeptoMailOptions): EmailService => {
	const { token, defaultFrom, url, bounceAddress } = options;

	if (!token) {
		throw new Error('Missing ZEPTOMAIL_TOKEN');
	}

	if (!defaultFrom) {
		throw new Error('Missing EMAIL_FROM for ZeptoMail provider');
	}

	const endpoint = url || DEFAULT_ZEPTOMAIL_URL;

	const sendToZeptoMail = async (payload: Record<string, unknown>) => {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				Authorization: `${token}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify(payload),
		});

		const rawText = await response.text();
		let parsed: unknown | undefined;

		if (rawText.trim().length) {
			try {
				parsed = JSON.parse(rawText);
			} catch (error) {
				throw new Error(
					`ZeptoMail returned malformed JSON (status ${response.status}): ${
						error instanceof Error ? error.message : 'Unknown parse error'
					}`
				);
			}
		}

		if (!response.ok) {
			const details =
				parsed && typeof parsed === 'object'
					? JSON.stringify(parsed)
					: rawText.trim() || response.statusText || `status ${response.status}`;
			throw new Error(`ZeptoMail request failed (${response.status}): ${details}`);
		}

		return {
			status: response.status,
			body: parsed,
		};
	};

	return {
		async send(envelope: EmailEnvelope): Promise<EmailResponse> {
			const to = toRecipientList(envelope.to);

			if (!to || !to.length) {
				throw new Error('ZeptoMail envelope requires at least one "to" recipient');
			}

			const fromMailbox = toMailbox(envelope.from ?? defaultFrom);

			const payload: Record<string, unknown> = {
				from: fromMailbox,
				to,
				subject: envelope.subject,
				...ensureBody(envelope),
			};

			// Only send a bounce address when explicitly configured; ZeptoMail rejects
			// arbitrary values that are not tied to their bounce domains.
			if (bounceAddress) {
				payload.bounce_address = bounceAddress;
			}

			if (envelope.cc) {
				const cc = toRecipientList(envelope.cc);
				if (cc?.length) {
					payload.cc = cc;
				}
			}

			if (envelope.bcc) {
				const bcc = toRecipientList(envelope.bcc);
				if (bcc?.length) {
					payload.bcc = bcc;
				}
			}

			if (envelope.replyTo) {
				payload.reply_to = [toMailbox(envelope.replyTo)];
			}

			// ZeptoMail supports additional properties such as headers, tags, and metadata
			// via their extended API. For now we focus on the core fields used by this app.

			try {
				const resp = await sendToZeptoMail(payload);

				return {
					providerId: 'zeptomail',
					// ZeptoMail can return a 202 with an empty body; expose the parsed response
					// so callers can inspect delivery status when available.
					raw: resp,
				};
			} catch (error) {
				// Normalize errors with a helpful prefix while preserving original details.
				const message =
					error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';

				throw new Error(`ZeptoMail request failed: ${message}`);
			}
		},
	};
};


