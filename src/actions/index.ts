import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';

import { getEmailService } from '../lib/email';
import type { EmailEnvelope } from '../lib/email';

const emailService = getEmailService();
const env = import.meta.env;
const archiveRecipients =
	env.EMAIL_BCC
		?.split(',')
		.map((value: string) => value.trim())
		.filter(Boolean) ?? [];
const archiveBcc = archiveRecipients.length ? archiveRecipients : undefined;

const getCompanyInbox = (): string => {
	const inbox = env.EMAIL_COMPANY_INBOX ?? env.EMAIL_FROM;
	if (!inbox) {
		throw new Error(
			'EMAIL_COMPANY_INBOX or EMAIL_FROM must be configured to route internal notifications.'
		);
	}
	return inbox;
};

const contactSchema = z.object({
	name: z.string().min(2, 'Name is required.'),
	email: z.string().email('Valid email required.'),
	type: z.enum(['project', 'collab', 'hello']).default('hello'),
	message: z.string().max(2000).optional(),
});

const safelySend = async (envelope: EmailEnvelope) => {
	try {
		return await emailService.send(envelope);
	} catch (error) {
		console.error('[actions] email send failed', error);
		throw new ActionError({
			code: 'SERVICE_UNAVAILABLE',
			message: 'We could not reach mission control. Please try again later.',
		});
	}
};

export const server = {
	contactForm: defineAction({
		accept: 'form',
		input: contactSchema,
		handler: async (input) => {
			const companyInbox = getCompanyInbox();
			const messagePayload = input.message?.trim() || 'No additional details provided.';
            const signalTypeMap: Record<string, string> = {
                project: 'Project Request',
                collab: 'Collaboration Idea',
                hello: 'Just Saying Hi'
            };
            const signalType = signalTypeMap[input.type] || input.type;

			await safelySend({
				to: input.email,
				subject: 'Laguna Studio: Signal Received',
				from: env.EMAIL_CONFIRMATION_FROM ?? env.EMAIL_FROM ?? companyInbox,
				textBody: [
					`Hi ${input.name},`,
					'',
					'We received your signal. If this was a project inquiry, one of us will review the specs and get back to you shortly.',
					'',
					`Signal Type: ${signalType}`,
					'',
					'— The Crew @ Laguna Studio Code',
				].join('\n'),
			});

			await safelySend({
				to: companyInbox,
				bcc: archiveBcc,
				subject: `[Laguna] New Signal from ${input.name}`,
				replyTo: input.email,
				textBody: [
					`Name: ${input.name}`,
					`Email: ${input.email}`,
					`Type: ${signalType}`,
					'',
					'Payload:',
					messagePayload,
				].join('\n'),
				metadata: {
					form: 'contact',
				},
			});

			return { ok: true };
		},
	}),
};
