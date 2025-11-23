declare module 'zeptomail' {
	export interface SendMailClientOptions {
		url: string;
		token: string;
	}

	export class SendMailClient {
		constructor(options: SendMailClientOptions);
		sendMail(payload: unknown): Promise<unknown>;
	}
}


