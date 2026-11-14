# Local review — 14 November 2026

Implemented on `feat/context-and-two-sided-journey`, following the local visual
redesign. No deployment or environment publication was performed.

Validation in Node.js 24:

- `npm test`: 111 tests pass across eleven files.
- `npm run typecheck`: passes.
- `npx eslint src`: passes without warnings.
- `npm run build`: passes, including all four optional integration routes.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`: two browser tests pass
  against both the development server and the compiled production server.

The browser journey covers real synthetic PDF/DOCX text extraction, all twelve
component navigation buttons, the major limit, recruiter confirmation/reload,
talent questions/consent, absence of CV text in browser storage or POST requests,
organiser decisions, separately persisted observations and mobile overflow.
The practice test covers transient answers, consent gating and component changes.

HTTP provider responses are mocked in unit tests. Missing-key routes were tested
and return explicit fallbacks. Live Context.dev and Gemini requests remain to be
validated after local credentials are configured; no sponsor integration is
claimed as a completed live demonstration yet.

Shared accounts, PostgreSQL, production retention jobs and public hosting remain
outside this local delivery. See ROADMAP.md and INTEGRATIONS.md.
