# Rosace delivery ladder

The local journey is implemented. It is not yet a deployed multi-user service.

| Stage                              | Current result                                                                                                         | Next validation or work                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 0. Fixed framework and calculation | Five competencies, twelve components, deterministic scores, ties and rosaces                                           | Keep the reference rules stable                                                               |
| 1. Recruiter                       | Company, job/document import, work setting, four task questions, twelve-component journey, level cards and live rosace | User review of wording and examples for target jobs                                           |
| 2. Talent                          | Local CV import, quoted clues, factual questions, confirmed levels, live rosace, optional six-month browser card       | Broader synthetic examples and usability review                                               |
| 3. Organiser                       | New needs/cards feed suggestions, human decisions with reasons and journal                                             | Shared-event accounts and permissions                                                         |
| 4. Conversation                    | Three to five questions, declared/expected view, separate A/C/F/NE observations                                        | Try the interview flow with fictional participants                                            |
| 4b. Online practice                | Twelve concrete exercises, review checklists, optional Featherless / optional Gemini feedback adapter                  | Live Featherless / optional Gemini check after credentials arrive; no automatic certification |
| 5. Company context and RAG         | Context.dev adapter, editable context, passage retrieval, Featherless / optional Gemini examples with human approval   | Configure keys locally and validate actual provider responses                                 |
| 6. Shared data and hosting         | Not implemented                                                                                                        | PostgreSQL, authentication, server retention/deletion, production limits; then choose hosting |

## Keys: when they are needed

- **Now:** no keys to run the whole manual flow in Cursor using Node.js.
- **Context.dev:** set `CONTEXT_DEV_API_KEY` in `.env.local` to try company-page
  collection. Context can be pasted while waiting.
- **Featherless:** set `AI_PROVIDER=featherless`, `FEATHERLESS_API_KEY` and `FEATHERLESS_MODEL`,
  restart, then explicitly request a proposal. Live provider validation remains
  outstanding. CVs continue to stay on the device.
- **Database/hosting:** only for sharing the app with multiple users. Aiven
  Runtime + PostgreSQL is a candidate from the sponsor docs; Supabase remains
  the database fallback. Vercel is optional.

Browser-local storage is not a database shared between recruiters and talents.
The synthetic demo deliberately lets the roles share one browser. The event has
multiple companies; it is not restricted to the City of Espoo as the employer.
There are no real accounts, online interview scheduling or automatic hiring decisions.

The application delivery is on `feat/visual-workspace`, separate from the audit-only
branch. Fetch that branch in Cursor to review the interface and use its local
launcher. A pull request does not update `main` until merged. No deployment or
environment publication is part of this change.
