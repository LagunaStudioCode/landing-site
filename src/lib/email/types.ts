export type EmailAddress =
	| string
	| {
			email: string;
			name?: string;
	  };

export type AddressList = EmailAddress | EmailAddress[];

export type EmailEnvelope = {
	to: AddressList;
	subject: string;
	from?: EmailAddress;
	cc?: AddressList;
	bcc?: AddressList;
	textBody?: string;
	htmlBody?: string;
	replyTo?: EmailAddress;
	headers?: Record<string, string>;
	tags?: string[];
	metadata?: Record<string, string | number>;
};

export type EmailProviderId = 'console' | 'sendgrid' | 'twilio' | 'mailgun';

export type EmailResponse = {
	providerId: EmailProviderId;
	messageId?: string;
	delivered?: boolean;
	raw?: unknown;
};

export interface EmailService {
	send(envelope: EmailEnvelope): Promise<EmailResponse>;
}

export type EmailProviderFactory = () => EmailService;


