# Laguna Studio Code Landing

Static landing page for Laguna Studio Code, powered by Astro 5 and Tailwind 4.

## Project Overview

This repository contains the source for the Laguna Studio Code landing page. It serves as a digital business card and capabilities showcase for a collective of senior software engineers.

Key sections:

* **Hero**: Brand introduction ("Engineering First").
* **Stack & Playground**: Overview of technical capabilities (Full-Stack, AI, Creative Coding, Infra).
* **Build Log**: A showcase of recent experiments and shipped projects.
* **The Crew**: Studio philosophy and values.
* **Contact**: A "Signal" based contact form for project requests and collaborations.

## Local Development

```bash
pnpm install
pnpm dev
```

The dev server runs on `http://localhost:4321`. Use `pnpm build` to generate production assets and `pnpm preview` to test the build locally.

## Contact Form & Actions

The contact form (`src/pages/index.astro`) submits to a server-side action defined in `src/actions/index.ts`. Submissions are processed using the **Email Service Strategy Pattern**.

When a user sends a signal (Project Request, Collaboration, or Hello):

1. **Client Confirmation**: The sender receives an auto-reply acknowledging receipt.
2. **Internal Signal**: The team receives a structured email at `EMAIL_COMPANY_INBOX` containing the payload and signal type.

### Environment Configuration

1. Copy `.env.example` to `.env`.
2. Configure the email provider (console, sendgrid, or zeptomail).
3. Set the routing variables:

| Variable | Description |
| --- | --- |
| `EMAIL_PROVIDER` | `console` (dev), `sendgrid`, or `zeptomail`. |
| `EMAIL_FROM` | Default verified sender address. |
| `EMAIL_CONFIRMATION_FROM` | Optional override for auto-replies. |
| `EMAIL_COMPANY_INBOX` | Destination for internal notifications. |
| `EMAIL_BCC` | Optional archive address. |
| `SENDGRID_API_KEY` | Required if using SendGrid. |
| `ZEPTOMAIL_TOKEN` | Required if using ZeptoMail. |
| `ZEPTOMAIL_URL` | Optional custom ZeptoMail API URL. |

### Cloudflare Runtime & Secrets

Actions execute inside Cloudflare Workers. Provide credentials through Wrangler secrets or the dashboard so they are exposed via `Astro.locals.runtime('cloudflare').env`:

```bash
pnpm wrangler secret put EMAIL_FROM
pnpm wrangler secret put ZEPTOMAIL_TOKEN
```

Local development still reads from `.env`, while `wrangler dev --remote` proxies the production bindings for end-to-end tests.

### Observability & Diagnostics

Structured logs (including ray IDs, colo, provider responses, and signal metadata) are sent to Cloudflare Observability:

* Tail logs live with `pnpm wrangler tail --format pretty`.
* In the dashboard, navigate to **Workers → Observability → Logs**, filter by service `lsc-marketing-site`, and search for messages starting with `actions.contactForm`.
* Logs are also emitted to the standard Worker console so `wrangler dev` shows the same diagnostics locally.

Use `wrangler dev --remote` plus `wrangler tail` to reproduce production issues while seeing the exact envelopes being accepted/rejected (no PII is logged—only counts and provider responses).

## Project Structure

```text
src/
├── actions/          # Server-side form handling (Zod validation)
├── assets/           # Static assets (logos, backgrounds)
├── layouts/          # Base HTML layout (metadata, global styles)
├── lib/email/        # Email provider abstraction
├── pages/            # Main landing page (index.astro)
└── styles/           # Global CSS & Tailwind theme
```

## Design System

The site uses a "Dark Future" aesthetic:

* **Background**: Space Black (`#0B0C10`)
* **Accents**: Neon Cyan (`#66FCF1`) & Deep Magenta (`#C3073F`)
* **Typography**: System sans-serif stack (clean, engineering-focused)
