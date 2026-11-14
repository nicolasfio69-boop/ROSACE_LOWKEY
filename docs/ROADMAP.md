# Rosace delivery ladder — 14 November 2026

Current delivery: `feat/coherent-ux`, PR #11. The local flow is implemented; this is not a deployed multi-user service.

| Stage | Implemented | Still to validate |
| --- | --- | --- |
| 0. Framework | Exact twelve approved action names; twenty technical actions in four families; deterministic calculation | Keep rules stable |
| 1. Recruiter | Company, role/import, setting, four task questions, live rosace, three majors, any minors, up to three technical skills and verification guidance | Espoo feedback on questions and examples |
| 2. Talent | On-device CV parsing, confirmed levels, optional six-month local card, restoration/deletion | Broader synthetic usability scenarios |
| 3. Organiser | Suggestions, ties, people without suggestions, reasoned human decisions and journal | Actual event capacities and process |
| 4. Conversation | Questions, on-site situations, human observations averaged on the task-level scale; C4.3 discussed only | Recruiter usability in a ten-minute meeting |
| 5. Checks | Three exercises × three levels, twenty-minute total; submission, human review, grade, separate observed rosace; optional explicit Claude feedback | Remaining online exercises are described but not implemented; live provider validation |
| 6. Guided demo and visual UX | Four NordChip/Amira stages, simplified menu, light pearl Aurora, construction/review motion and reduced-motion fallback | Owner visual review and jury narrative |
| 7. Hosting | Next.js standalone, Node 22 Dockerfile, documented Aiven Runtime deployment from GitHub | Account credits, European region, live deployment and provider secrets |
| 8. Shared event service | Deferred | Authentication, shared storage, server retention/deletion; no PostgreSQL in this delivery |

## Credentials and local use

No credentials are needed for the manual flow. In Cursor, fetch and switch to `feat/coherent-ux`, run `npm ci` once (and after lockfile changes), then `npm run dev`. Open http://localhost:3000.

For optional AI, configure `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` in ignored `.env.local`, then restart. `CONTEXT_DEV_API_KEY` is optional for company context. On Aiven use runtime secret settings, never Git. No live paid call or deployment is part of this change. See [DEPLOY_AIVEN.md](DEPLOY_AIVEN.md).

Browser storage is not shared across devices. The demo uses fictional companies and talents and a role switch without authentication. CVs remain transient; local card deletion/expiry removes linked checks and observations. The talent never sees a ranking or alignment score.

Open owner decisions: delivery format (video/slides/submission text), deadline, pitch duration, team and Espoo feedback. The verification plan, mean aggregation, simplified menu and twentieth technical skill are now approved in [CADRAGE.md](CADRAGE.md).

Latest follow-up: separate candidate/recruiter workspaces and Claude RAG proposals are implemented. Configure and validate the API locally with [CLAUDE_SETUP.md](CLAUDE_SETUP.md). The original simplified menu has been replaced by role-specific navigation.
