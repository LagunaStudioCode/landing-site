import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';

import { getEmailService } from '../lib/email';
import type { EmailEnvelope, EmailService } from '../lib/email';
import type { RuntimeEnv } from '../lib/email/registry';
import { createObservabilityLogger } from '../lib/logging/observability';
import { getCloudflareRuntime, getRequestMeta } from '../lib/runtime/cloudflare';

const contactSchema = z.object({
	name: z.string().min(2, 'Name is required.'),
	email: z.string().email('Valid email required.'),
	type: z.enum(['project', 'collab', 'hello']).default('hello'),
	message: z.string().max(2000).optional(),
});

const signalTypeMap: Record<string, string> = {
	project: 'Project Request',
	collab: 'Collaboration Idea',
	hello: 'Just Saying Hi',
};

const staticEnv = (import.meta.env ?? {}) as RuntimeEnv;

const toRuntimeEnv = (runtimeEnv?: Record<string, unknown>): RuntimeEnv => {
	if (!runtimeEnv) return staticEnv;
	const filtered = Object.entries(runtimeEnv).reduce<Record<string, string>>((acc, [key, value]) => {
		if (typeof value === 'string') {
			acc[key] = value;
		}
		return acc;
	}, {});
	return {
		...staticEnv,
		...filtered,
	};
};

const getArchiveBcc = (env: RuntimeEnv): string[] | undefined => {
	const recipients =
		env.EMAIL_BCC
			?.split(',')
			.map((value: string) => value.trim())
			.filter(Boolean) ?? [];

	return recipients.length ? recipients : undefined;
};

const getCompanyInbox = (env: RuntimeEnv): string => {
	const inbox = env.EMAIL_COMPANY_INBOX ?? env.EMAIL_FROM;
	if (!inbox) {
		throw new Error(
			'EMAIL_COMPANY_INBOX or EMAIL_FROM must be configured to route internal notifications.'
		);
	}
	return inbox;
};

type ObservabilityLogger = ReturnType<typeof createObservabilityLogger>;

const extractProviderDiagnostics = (raw: unknown) => {
	if (!raw || typeof raw !== 'object') {
		return {};
	}

	const maybeStatus = (raw as { status?: number }).status;
	const maybeBody = (raw as { body?: unknown }).body;

	return {
		providerStatus: maybeStatus,
		providerBody: maybeBody,
	};
};

const safelySend = async (
	service: EmailService,
	envelope: EmailEnvelope,
	logger: ObservabilityLogger,
) => {
	try {
		const response = await service.send(envelope);
		await logger.info('email dispatched', {
			provider: response.providerId,
			messageId: response.messageId,
			...extractProviderDiagnostics(response.raw),
		});
		return response;
	} catch (error) {
		await logger.error('email dispatch failed', error, {
			subject: envelope.subject,
			toCount: Array.isArray(envelope.to) ? envelope.to.length : 1,
			hasBcc: Boolean(envelope.bcc),
		});
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
		handler: async (input, context) => {
			const runtime = getCloudflareRuntime(context);
			const requestMeta = getRequestMeta(runtime);
			const logger = createObservabilityLogger({
				runtime,
				requestMeta,
				defaultAction: 'actions.contactForm',
			});

			const runtimeEnv = toRuntimeEnv(runtime?.env);
			const companyInbox = getCompanyInbox(runtimeEnv);
			const archiveBcc = getArchiveBcc(runtimeEnv);
			const emailService = getEmailService({ env: runtimeEnv, useCache: false });
			const messagePayload = input.message?.trim() || 'No additional details provided.';
			const signalType = signalTypeMap[input.type] || input.type;
			const emailDomain = input.email.split('@')[1] ?? 'unknown';

			await logger.info('contact signal received', {
				signalType,
				emailDomain,
				nameLength: input.name.length,
				messageLength: messagePayload.length,
				emailProvider: runtimeEnv.EMAIL_PROVIDER ?? 'console',
			});

			const confirmationLogger = logger.withAction('actions.contactForm.confirmation');
			const confirmationResponse = await safelySend(
				emailService,
				{
					to: input.email,
					subject: 'Laguna Studio: Signal Received',
					from: runtimeEnv.EMAIL_CONFIRMATION_FROM ?? runtimeEnv.EMAIL_FROM ?? companyInbox,
					textBody: [
						`Hi ${input.name},`,
						'',
						'We received your signal. If this was a project inquiry, one of us will review the specs and get back to you shortly.',
						'',
						`Signal Type: ${signalType}`,
						'',
						'— The Crew @ Laguna Studio Code',
					].join('\n'),
				},
				confirmationLogger,
			);

			const internalLogger = logger.withAction('actions.contactForm.internal');
			const internalResponse = await safelySend(
				emailService,
				{
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
				},
				internalLogger,
			);

			await logger.info('contact signal processed', {
				confirmationMessageId: confirmationResponse?.messageId,
				internalMessageId: internalResponse?.messageId,
				signalType,
			});

			return { ok: true };
		},
	}),
};
