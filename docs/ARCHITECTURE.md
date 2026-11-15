# Architecture

Rosace is a single Next.js 15 application (React 19, TypeScript). Pages run in
the browser; a few API routes run on the server only to reach Claude and
Context.dev. There is no database: workspace data is kept in browser storage.

```
Browser                                   Server (Next.js route handlers)
───────                                   ─────────────────────────────
pages + components                        /api/need-proposal     ┐
  │  document parsing (pdf.js, mammoth)   /api/level-examples    │ Claude
  │  scoring, suggestions, observations   /api/check-proposal    │ (Messages API)
  │  localStorage workspace               /api/exercise-feedback ┘
  └── fetch (same origin) ─────────────▶  /api/company-context  ── Context.dev
                                          /api/integrations      (config status)
```

## Modules

| Path                                                    | Responsibility                                                          |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/lib/framework.ts`                                  | The 12 components, 20 technical skills in 4 families, level descriptors |
| `src/lib/scoring.ts`                                    | Need rules (`checkNeed`) and declared alignment (`align`)               |
| `src/lib/suggestions.ts`                                | Suggested, tied, other and ineligible talents per need                  |
| `src/lib/observations.ts`                               | Observed values from A / C / F / NE                                     |
| `src/lib/conversation.ts`                               | Questions for the conversation guide                                    |
| `src/lib/talent-intake.ts`                              | On-device CV clues and level suggestions                                |
| `src/lib/document-import.ts`                            | PDF, DOCX, TXT and MD parsing in the browser                            |
| `src/lib/workspace.ts`, `need-storage.ts`               | Validated browser storage, retention and deletion                       |
| `src/lib/verification.ts`, `exercises.ts`, `check-*.ts` | How each component is checked; exercise plans and timing                |
| `src/lib/context.ts`                                    | Passage retrieval over reviewed job and company text                    |
| `src/lib/ai-proposals.ts`                               | Validation of AI proposals (shared by client and server)                |
| `src/lib/server/*`                                      | Claude client, Context.dev client, request guards                       |
| `src/components/Rosace.tsx`                             | The rosace chart (SVG)                                                  |

Domain logic in `src/lib` is made of pure functions and is unit-tested next to
the code (`*.test.ts`). Components only render and call these functions.

## Scoring rules

A company need has exactly 3 major components, any number of minor components
and at most 3 technical skills. Each requirement has an expected level from 1
(Foundation) to 3 (Advanced).

| Requirement     | Weight |
| --------------- | ------ |
| Major component | 2      |
| Minor component | 1      |
| Technical skill | 2      |

- `points = weight × min(declared level, expected level)`. Being above the
  expected level earns nothing but is shown.
- Shown as a fraction ("13 out of 19"), never as a percentage.
- A card is **complete** when the filled-in weight reaches 70 % of the total.
- A talent is **eligible** when the card is complete and reaches at least
  Foundation on one major.
- Eligible talents are sorted by points up to the recruiter's capacity. A tie
  at the cut is never broken; it goes to the organiser.
- A CV mention without detail counts as unknown, not as a level. Where a
  statement comes from is displayed but never changes the points.

After a meeting, an observation is `task level × performance` with
A = 1, C = 0.6, F = 0 and NE ignored. Several observations of one component
are averaged. Observations never overwrite the declaration.

The rosace uses a fixed scale everywhere: disk edge = Foundation, inner ring =
Intermediate, outer circle = Advanced. Majors are drawn in gold, on top.

## AI pipeline

1. The recruiter pastes, imports or collects (Context.dev) job and company
   text, then confirms they reviewed it. CVs never enter this corpus.
2. `retrievePassages` splits the text into passages and ranks them lexically
   against the role and the skill. This is retrieval, not training and not a
   vector database.
3. The route sends a bounded set of passages to Claude with fixed rules: the
   documents are data, not instructions; answer from the closed catalogue; cite
   passage IDs; never use bias inputs.
4. The server validates the JSON: known codes only, 3 majors, at most 3
   technical skills, valid levels, existing citations. Anything else is
   rejected or dropped before display.
5. The recruiter accepts or discards the proposal. For exercise feedback,
   Claude may recommend A / C / F / NE with quotes from the answer; only the
   recruiter records a grade.

## Security and privacy

- API keys are read on the server only (`ANTHROPIC_API_KEY`,
  `CONTEXT_DEV_API_KEY`); no `NEXT_PUBLIC_` secret exists.
- API routes accept same-origin JSON up to 64 KB, return `no-store` and never
  echo provider errors.
- Rate limits per visitor (6 per minute), per site (40 per minute) and per day
  (600), kept in process memory. Provider calls time out after 45 s.
- Company collection only accepts public HTTPS sites; local addresses, IPs and
  social profiles are refused.
- Security headers on every response: CSP, HSTS, `X-Frame-Options: DENY`,
  `nosniff`, referrer and permissions policies (`next.config.ts`).
- Browser storage is treated as untrusted and validated on read. A talent card
  expires after six months; deleting it removes linked answers and
  observations.

## Tests

- **Unit** (`npm test`): scoring, suggestions, storage, retrieval, AI output
  validation, request guards, with provider calls mocked.
- **End to end** (`npm run test:e2e`): the recruiter, talent, organiser,
  conversation and checks journeys, document import with real PDF and DOCX
  fixtures, persistence, mobile layouts and keyboard use.
