import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';

import { getEmailService } from '../lib/email';
import type { EmailEnvelope } from '../lib/email';

const emailService = getEmailService();
const env = import.meta.env;
const archiveRecipients =
	env.EMAIL_BCC
		?.split(',')
		.map((value) => value.trim())
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

const multiSelect = <T extends z.ZodTypeAny>(schema: T) =>
	z.preprocess(
		(value) => {
			if (Array.isArray(value)) return value;
			if (value === null || value === undefined || value === '') return [];
			return [value];
		},
		z.array(schema)
	);

const contactSchema = z.object({
	name: z.string().min(2, 'Name is required.'),
	email: z.string().email('Valid email required.'),
	context: z.string().optional(),
	needs: multiSelect(
		z.enum(['strategy', 'workflow', 'training', 'governance'], {
			required_error: 'Select at least one need.',
		})
	),
	message: z.string().max(2000).optional(),
});

const investorSchema = z.object({
	email: z.string().email('Valid email required.'),
	fund: z.string().optional(),
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

const renderNeeds = (needs: string[]) => (needs.length ? needs.join(', ') : 'Not specified');

export const server = {
	contactForm: defineAction({
		accept: 'form',
		input: contactSchema,
		handler: async (input) => {
			const companyInbox = getCompanyInbox();
			const normalizedNeeds = input.needs ?? [];
			const missionDetails = input.message?.trim() || 'No additional details provided.';
			const teamContext = input.context?.trim() || 'Unspecified';

			await safelySend({
				to: input.email,
				subject: 'Spacewalkers mission received',
				from: env.EMAIL_CONFIRMATION_FROM ?? env.EMAIL_FROM ?? companyInbox,
				textBody: [
					`Hi ${input.name},`,
					'',
					'Thanks for reaching out to Spacewalkers. Our team has received your mission details and will respond shortly.',
					'',
					`Mission focus: ${renderNeeds(normalizedNeeds)}`,
					`Team context: ${teamContext}`,
					'',
					'— Spacewalkers Flight Crew',
				].join('\n'),
			});

			await safelySend({
				to: companyInbox,
				bcc: archiveBcc,
				subject: `New contact from ${input.name}`,
				replyTo: input.email,
				textBody: [
					`Name: ${input.name}`,
					`Email: ${input.email}`,
					`Context: ${teamContext}`,
					`Needs: ${renderNeeds(normalizedNeeds)}`,
					'',
					'Mission details:',
					missionDetails,
				].join('\n'),
				metadata: {
					form: 'contact',
				},
			});

			return { ok: true };
		},
	}),
	investorRequest: defineAction({
		accept: 'form',
		input: investorSchema,
		handler: async (input) => {
			const companyInbox = getCompanyInbox();
			const fundName = input.fund?.trim() || 'Unspecified fund';

			await safelySend({
				to: input.email,
				subject: 'Investor deck request received',
				from: env.EMAIL_CONFIRMATION_FROM ?? env.EMAIL_FROM ?? companyInbox,
				textBody: [
					'Thanks for your interest in Spacewalkers.',
					'Our founding team will review your request and follow up with the latest materials.',
					'',
					`Fund / Firm: ${fundName}`,
					'',
					'— Spacewalkers Flight Crew',
				].join('\n'),
			});

			await safelySend({
				to: companyInbox,
				bcc: archiveBcc,
				subject: `Investor request from ${input.email}`,
				replyTo: input.email,
				textBody: [`Investor email: ${input.email}`, `Fund: ${fundName}`].join('\n'),
				metadata: {
					form: 'investor',
				},
			});

			return { ok: true };
		},
	}),
};


