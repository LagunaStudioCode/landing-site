import type { EmailEnvelope, EmailResponse, EmailService } from '../types';

const redact = <T>(value: T): T => value;

export const createConsoleEmailService = (): EmailService => {
	return {
		async send(envelope: EmailEnvelope): Promise<EmailResponse> {
			const payload = {
				...envelope,
				textBody: envelope.textBody ?? envelope.htmlBody ?? '',
			};

			console.info('[email:console] outbound envelope', redact(payload));

			return {
				providerId: 'console',
				delivered: true,
			};
		},
	};
};


