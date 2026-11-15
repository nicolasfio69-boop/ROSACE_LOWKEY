# Security and data handling

## Reporting a problem

Please open a private security advisory on GitHub (Security → Report a
vulnerability) rather than a public issue. Include the route or component,
the steps to reproduce and the impact.

## What the application protects

- **CVs never leave the browser.** Documents are parsed on the device; no
  upload endpoint exists and CV text is never sent to an AI provider.
- **Secrets stay on the server.** `ANTHROPIC_API_KEY` and
  `CONTEXT_DEV_API_KEY` are read only by route handlers in `src/lib/server`.
- **API routes** accept same-origin JSON up to 64 KB, return `no-store`,
  sanitise provider errors and apply per-visitor, per-site and daily limits.
- **Company collection** accepts public HTTPS websites only; local addresses,
  IP literals and social profiles are refused.
- **Headers:** CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, referrer and
  permissions policies on every response (`next.config.ts`).

## Known limits

This is a demo without accounts: roles are separate workspaces, data stays in
one browser, and rate limits are kept in process memory. A production
deployment would need authentication, server-side storage with retention
jobs, and durable rate limiting. See the README for the full list.
