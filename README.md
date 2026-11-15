# Rosace

Skills-based matchmaking for Espoo recruitment events. Built for the City of
Espoo challenge "Rethinking Recruitment" at Junction 2026.

> We turn claims into questions you can check during the conversation.

AI-written CVs all look alike. Rosace helps a company say which skills a role
really needs, helps a talent describe what they have actually done, and gives
the recruiter a short conversation guide to check those claims in person.
A person always makes the decision.

- **Live demo:** https://holy-nice-impala.eur-1.aiven.app (fictional data only)
- **3-minute guided demo:** `/tour`

## How it works

1. **Recruiter need** (`/need/new`). The company describes the role, then picks
   3 major components, any number of minor components and up to 3 technical
   skills, each with an expected level. Level cards and optional Claude
   suggestions, grounded in the reviewed job and company text, help choose.
2. **Talent card** (`/talent/new`). The talent imports a CV, which is parsed in
   the browser and never stored. Local rules quote possible clues; the talent
   answers factual questions and confirms each level.
3. **Event desk** (`/organiser`). Rosace suggests who should meet and shows the
   reasons. Ties are never broken automatically, and people without a
   suggestion are listed with a next step. The organiser approves each meeting
   with a one-line reason.
4. **Conversation guide** (`/brief`). Questions target unknown or
   below-expected skills. After the meeting the recruiter records what was
   observed (A / C / F / NE), kept separate from what was declared.
5. **Checks** (`/checks`, `/talent/checks`). Short timed exercises reviewed by a
   person. Claude may recommend a grade with quoted evidence; only the
   recruiter can record it.

### The skills framework

Rosace is inspired by a real, working competency system designed at École
Centrale de Lyon: 5 competencies, 12 components written as action verbs (for example "Break down
a problem", "Get it right and spot the error"), three levels (Foundation,
Intermediate, Advanced, plus "Not yet") and the rosace chart. It is fixed;
company needs adapt on top of it.

Alignment is a fraction, never a percentage: `points = weight × min(declared,
expected)`, with weight 2 for majors and technical skills and 1 for minors. A
card is complete when 70 % of the requirement weight is filled in. Details:
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Responsible by design

- **Human decision.** Suggestions are explained and editable; no tie is broken
  automatically; AI output is a proposal that a person accepts or discards.
- **No bias inputs.** Nationality, language, age, gender, degree names and
  career path never enter a calculation or a prompt.
- **Minimal personal data.** CVs are parsed on the device and never uploaded,
  stored or sent to an AI provider. A saved talent card holds a pseudonym and
  confirmed levels, needs explicit consent and expires after six months.
- **Talents never see a rank or a score**, only their own rosace.
- **Grounded AI.** Claude only sees recruiter-reviewed job and company text,
  must cite the passages it used and answer from a closed catalogue. Every
  response is schema-checked on the server.

## Getting started

Requirements: Node.js 22.13 or newer (24 LTS recommended).

```bash
npm ci
npm run dev        # http://localhost:3000
```

On Windows, `start-local.cmd` installs dependencies when needed, starts the
app on port 3001 and opens the browser.

No API key is needed for the manual flows. To enable Claude and company
context, copy `.env.example` to `.env.local` and fill in the keys (see
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)). Never commit a key.

## Scripts

| Command                       | What it does                             |
| ----------------------------- | ---------------------------------------- |
| `npm run dev`                 | Development server                       |
| `npm run build` / `npm start` | Production build and server              |
| `npm run lint`                | ESLint                                   |
| `npm run typecheck`           | TypeScript, no emit                      |
| `npm test`                    | Unit tests (Vitest)                      |
| `npm run test:e2e`            | Browser tests (Playwright)               |
| `npm run check`               | Lint, typecheck and unit tests           |
| `npm run test:claude`         | One bounded call to check the Claude key |

CI runs lint, typecheck, unit tests, build and the Playwright suite on every
pull request (`.github/workflows/ci.yml`).

## Project layout

```
src/
  app/          Next.js routes (pages and /api handlers)
  components/   React components (Rosace chart, forms, workspaces)
  data/         Synthetic demo data and exercises
  lib/          Domain logic: framework, scoring, suggestions, storage
  lib/server/   Server-only code: Claude, Context.dev, HTTP guards
e2e/            Playwright tests and synthetic fixtures
docs/           Architecture, deployment, credits, decision log
scripts/        Local launcher and Claude connection check
```

## Known limitations

- Data lives in one browser. Roles are separate workspaces, not authenticated
  accounts, and nothing is shared across devices.
- Retention runs when the workspace is opened; a closed browser cannot purge.
- AI rate limits are kept in process memory, so with several server instances
  each instance counts separately. They protect demo credits; they are not
  multi-user controls.
- The quality of Claude's suggestions and grade recommendations has not been
  evaluated with Espoo recruiters yet.

## Documentation

- [Architecture](docs/ARCHITECTURE.md): modules, data flow, AI pipeline, security
- [Deployment](docs/DEPLOYMENT.md): configuration, Docker, Aiven Runtime
- [Credits](docs/CREDITS.md): third-party UI adaptations
- [Decision log](docs/CADRAGE.md) (French): every product decision, dated

## How it was built

Built in 48 hours at Junction 2026. Product decisions were made by the team and
logged in the decision log; AI coding assistants were used for implementation,
reviews and tests.
