# Dev Log

```json
{
  "id": "2025-11-23-email-strategy",
  "date": "2025-11-23",
  "scope": "contact-email-routing",
  "decision": "Adopt a strategy-pattern email service abstraction powering all contact forms via Astro Actions.",
  "context": {
    "problems": [
      "Need both confirmation and internal triage emails from contact forms.",
      "Must be able to swap providers (SendGrid, Twilio, Mailgun, etc.) without touching UI or business logic.",
      "Astro forms currently mocked in the client and do not reach a backend."
    ],
    "requirements": [
      "Single interface consumed by server actions.",
      "Provider selection must be configuration-driven (`EMAIL_PROVIDER`).",
      "Support local development without external API calls."
    ]
  },
  "implementation": {
    "interface": {
      "file": "src/lib/email/types.ts",
      "contract": "EmailService { send(envelope: EmailEnvelope): Promise<EmailResponse>; }",
      "envelope": "Contains to, cc, bcc, subject, textBody, htmlBody, replyTo, headers."
    },
    "providers": {
      "location": "src/lib/email/providers/*",
      "selection": "Env-driven factory (getEmailService) registered in src/lib/email/registry.ts.",
      "default": "Console provider logs payload for dev/test, never throws.",
      "realProviders": "Shipped SendGrid scaffold showing required methods; additional providers follow same signature."
    },
    "serverActions": [
      "contactForm action builds confirmation + internal envelopes using templates, invokes email service twice sequentially.",
      "investorRequest action mirrors behavior with investor-specific copy."
    ],
    "errorHandling": "Provider failures wrapped with Astro ActionError { code: 'SERVICE_UNAVAILABLE' } so UI can show retry guidance."
  },
  "configuration": {
    "env": [
      "EMAIL_PROVIDER=console|sendgrid|twilio|mailgun",
      "EMAIL_FROM=verified sender address",
      "EMAIL_CONFIRMATION_FROM=optional override for client-facing copy",
      "EMAIL_COMPANY_INBOX=triage inbox destination",
      "EMAIL_BCC=optional compliance archive"
    ],
    "files": [
      ".env.example documents required keys",
      "README.md adds setup instructions and provider-switching steps"
    ]
  },
  "testing": {
    "dev": "Default to console provider to observe envelopes in terminal logs.",
    "switching": "Change EMAIL_PROVIDER env var and restart server; no code changes required.",
    "future": "Add integration tests per provider by stubbing EmailService."
  }
}
```


