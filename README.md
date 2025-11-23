# Spacewalkers Marketing Site

Static marketing + investor site powered by Astro 5 with Tailwind 4 styles.

## Local Development

```bash
pnpm install
pnpm dev
```

The dev server runs on `http://localhost:4321`. Use `pnpm build` to generate production assets and `pnpm preview` to test the build locally.

## Contact + Investor Forms

Both the marketing contact form (`src/pages/index.astro`) and investor request form (`src/pages/investors.astro`) submit through [Astro Actions](https://docs.astro.build/en/guides/actions/). Each submission triggers two emails via the strategy-pattern email service:

1. **Client confirmation** – reassuring copy goes to the submitter.
2. **Internal triage** – structured summary goes to `EMAIL_COMPANY_INBOX`.

All email routing is centralized in `src/lib/email/`, so swapping providers never requires frontend changes.

### Environment configuration

1. Copy `.env.example` to `.env`.
2. Set `EMAIL_PROVIDER` to `console` (logs payloads locally) or `sendgrid`.
3. Provide the base routing variables:

| Variable | Description |
| --- | --- |
| `EMAIL_PROVIDER` | `console` for dev logging, or `sendgrid` for SendGrid REST delivery. |
| `EMAIL_FROM` | Default verified sender (used when actions omit `from`). |
| `EMAIL_CONFIRMATION_FROM` | Optional override for confirmation emails. |
| `EMAIL_COMPANY_INBOX` | Internal triage inbox for new submissions. |
| `EMAIL_BCC` | Optional archive recipient (leave blank to disable). |
| `SENDGRID_API_KEY` | Required when `EMAIL_PROVIDER=sendgrid`. |

Restart the dev server after changing provider-specific env vars so the email registry picks up the new configuration.

### Adding new providers

1. Create `src/lib/email/providers/<provider>.ts` implementing the `EmailService` contract from `src/lib/email/types.ts`.
2. Register the factory inside `src/lib/email/registry.ts`.
3. Document any new env vars in `.env.example` and the table above.

## Project structure

```text
src/
├── actions/          # Astro Actions for form submissions
├── layouts/          # Shared page layouts
├── lib/email/        # Provider-agnostic email service abstraction
├── pages/            # Marketing + investor routes
└── styles/           # Global CSS
```

Refer to [the Astro docs](https://docs.astro.build) for framework-specific details.
