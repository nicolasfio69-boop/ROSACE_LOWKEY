# Changelog

## 1.0.0 — 15 November 2026 (Junction submission)

### Added

- Recruiter need: 3 major components, any minors, up to 3 technical skills,
  level cards and optional Claude suggestions grounded in reviewed context.
- Talent card from a CV parsed on the device, with factual questions and
  confirmed levels; consented saving with six-month expiry.
- Event desk: explained suggestions, ties left to the organiser, people
  without a suggestion with a next step, decision journal.
- Conversation guide with A / C / F / NE observations kept apart from
  declarations.
- Timed checks reviewed by a recruiter; Claude may recommend a grade with
  quoted evidence, only the recruiter records it.
- Three-minute guided demo at `/tour`.
- Company context collection through Context.dev.
- Deployment on Aiven Runtime from the root `Dockerfile`.
- CI: format, lint, typecheck, unit tests, build and Playwright suite.

### Security

- Same-origin, size-limited API routes with rate limits and security headers.
