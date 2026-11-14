# Rosace

A local recruitment-event demo for Junction 2026 and the City of Espoo.
“We turn claims into questions you can check during the conversation.”

The fixed Centrale framework has 5 competencies, 12 components, three skill
levels plus “Not yet”, and a rosace that grows as selections are confirmed.
A human chooses the requirements and approves meetings. Repository examples are fictional.

## Get the current application from GitHub

The audit PR contains only a document. For this application delivery, fetch and
switch to the application branch in your existing clone (commit or stash your own
local changes first if Git reports a conflict):

```bash
git fetch origin
git switch feat/visual-workspace
```

`git switch` creates a tracking branch from `origin/feat/visual-workspace` when
needed. Stay on that branch until its PR is merged; `main` does not receive the
new application just because the PR is open. For subsequent updates on the branch,
use `git pull --ff-only`. No ZIP download is needed.

## Open in Cursor and run locally

Install **Node.js 24 LTS** (22.13 or newer is required).

**Windows: open the repository folder and double-click `start-local.cmd`.** It installs dependencies on first launch or when the lockfile
or Node major version changes, starts the server and opens the browser when ready.
Later launches skip installation. Cursor does not need to be open. Keep the
server window open; Ctrl+C stops it. If Rosace is already running, the launcher
opens it again without starting a second copy.

If you prefer the Cursor terminal (open the folder containing `package.json`):

```bash
npm ci
npm run dev
```

Use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`. `npm ci` is needed only
for the first manual installation or after dependency changes. After that,
`npm run dev` is enough. On macOS/Linux, `npm run local` provides
the automatic launcher too.

For `npm run dev`, open **http://localhost:3000** on the same computer. The
one-click launcher uses **http://localhost:3001** instead. No AI key or hosting
account is needed. Cursor and Claude subscriptions do not replace Node.js or
API credits.

If port 3001 is occupied, use `--port 3002` and open `http://localhost:3002`.
If an old server shows an error after updating files, stop it with Ctrl+C,
remove only the generated `.next` folder, run `npm ci`, and start again.

## What to try

1. **Recruiter — `/need/new`:** enter the company, role, job description, on-site /
   hybrid / remote setting, workplace and available support. Four questions
   clarify the task, collaborators, expected outcome and difficulty. Import a
   text PDF, DOCX, TXT or MD, or paste text. Click a rosace branch (or use Tab, arrows and Enter) to explore the 12 components,
   compare level cards and pick exactly 3 majors, up to 2 minors, then up to 2
   job skills. Watch the live rosace and confirm the need.
2. **Talent — `/talent/new`:** import a fictional CV or use the example. Local
   keyword rules quote possible clues without assigning a level. Answer factual
   questions, confirm or correct each level and build the other side of the
   rosace. Optionally save the confirmed card with explicit consent.
3. **Organiser — `/organiser`:** saved needs and cards join the synthetic examples.
   Review suggestions, ties and people without suggestions. Approve, add or
   remove a meeting with a reason; the decision appears in a journal.
4. **Conversation — `/conversations` or “Prepare conversation”:** explore 3–5 questions prioritising unknown or below-expected declarations, compare
   declared and expected skills, and record A/C/F/NE observations. Observed
   values stay separate from declared levels.
5. **Practice — `/practice`:** try one fictional exercise per component. Review
   the checklist or explicitly request optional AI feedback. It does not
   certify a skill or modify a talent card.

The original synthetic overview remains at `/demo`. The organiser handles one
local event workspace with multiple companies; there are no authenticated roles.

## Company context and Featherless AI

Manual context and hand-written examples work immediately. Embedded developer
roles have dedicated scenarios; other roles use framework examples with the
entered job context visible alongside. Featherless can propose more specific examples
from approved job and company passages once configured. Online practice feedback
is also optional. Neither integration has been validated with live credentials.

Copy `.env.example` to `.env.local`, fill in only the credentials you have and
restart the server. Never paste keys into chat or use `NEXT_PUBLIC_` for secrets.
See [integration details and sponsor sources](docs/INTEGRATIONS.md).

## Storage and privacy in this local demo

- Job drafts, confirmed needs, organiser decisions and observations are stored in
  this browser. They are not shared across computers or browser profiles.
- Documents are parsed on the device. **CV files and CV text are never uploaded,
  persisted or sent to any AI provider.** Short quoted clues exist only in page memory.
- Saving a talent card requires consent; only its pseudonym and confirmed levels
  are saved. Cards expire after six months and are purged, with related decisions
  and observations, when the workspace is next opened. A closed browser cannot
  run a retention job. Talent cards can also be deleted immediately.
- Practice answers are in page memory only. An explicit request sends the answer
  to the configured AI provider; the app does not store or log it. Provider retention depends on the
  API account terms: keep exercises fictional during the demo.
- Database-backed access control, deletion jobs and shared data are still future
  work. Do not expose these local API routes publicly before adding authentication,
  durable rate limits and account-level budget controls.

## Checks

```bash
npm test
npm run test:launcher
npm run typecheck
npx eslint src
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests use synthetic PDF/DOCX fixtures and check the recruiter-to-interview
flow, local CV handling and mobile layouts. In a managed Linux environment with
Chromium installed, use `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`.

See [the delivery ladder](docs/ROADMAP.md). Coding agents: read [AGENTS.md](AGENTS.md).
