# Rosace delivery ladder

This is a delivery plan, not a claim that the end-to-end product is finished.
The fixed Centrale framework and deterministic scoring remain authoritative.

| Stage                           | Status                                      | Deliverable                                                                                                                                                                | Credentials needed                                      |
| ------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 0. Foundation                   | Implemented                                 | Five competencies, twelve components, scoring, suggestion rules, synthetic needs and talents, rosace                                                                       | None                                                    |
| 1. Recruiter experience         | Implemented; visual redesign pending review | Guided role → priorities → levels → confirmation, live rosace, browser draft storage; synthetic overview at /demo                                                          | None                                                    |
| 2. Talent experience            | Next                                        | /talent/new, CV text in memory only, quoted skill spotting through manual rules, three factual questions, talent confirmation, own rosace without rank or score            | None for the first version                              |
| 3. Organiser workflow           | Planned                                     | Connect created needs and talent cards to suggestions; organiser approves/adjusts meetings with reasons and a journal; resolve ties explicitly                             | None for a synthetic local prototype                    |
| 4. Conversation and observation | Planned                                     | /brief/[need]/[talent], verification questions, expected vs declared rosace, A/C/F/NE observation kept separate                                                            | None for manual examples                                |
| 5. Shared data and hosting      | Planned                                     | PostgreSQL schema, server-side validation and retention/deletion; deployment and HTTPS smoke checks                                                                        | Database connection and hosting account                 |
| 6. Gemini assistance            | Planned                                     | Server-only assistance for need questions, level examples, skill spotting and briefs; validate output against the closed framework; human confirmation and manual fallback | Gemini API key, obtained when starting this integration |

## Where we are now

The foundation and recruiter screen work. This is not yet a complete recruitment
workflow. A created need stays in the browser; it does not feed the fixed demo
matches. Browser storage is not a shared database. There is no deployed public
site, talent creation screen, organiser approval screen or interview screen in
this implementation.

## Accounts and keys, at the right time

- Now: Node.js and the existing GitHub connection are enough. No Gemini key is required.
- Before stage 5: choose hosting and provision PostgreSQL. Aiven Runtime plus
  Aiven PostgreSQL is a candidate from the Junction materials; verify account
  availability, pricing, deployment compatibility and the selected EU region.
  Supabase remains the database fallback. Vercel is optional, not a prerequisite.
- Before stage 6: create a dedicated Gemini key and set a usage budget. Check the
  provider's data-handling terms before sending any CV text. Keep CVs out of
  storage, request logs and AI logs; use synthetic data during development.
- Local secrets belong in ignored `.env.local`; production secrets belong in
  the host's secret settings. Never commit keys, use `NEXT_PUBLIC_` for a secret,
  or put a key in browser code or chat. An account subscription for a coding
  assistant does not supply Gemini API credits.
- Modal, Verda and other sponsor APIs are optional. Add one only when a concrete
  feature requires it; do not introduce services solely to enter more challenges.

## Review gates

Review the guided recruiter screen visually before extending its design to talent
and organiser flows. For every implementation step, run tests, TypeScript, ESLint
and the production build, then exercise the relevant user journey. Keep each step
on a branch with a reviewable PR when publication is authorised. Never publish or
deploy the environment merely because a local review succeeded.
