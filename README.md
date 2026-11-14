# Rosace (working name)

Matchmaking for City of Espoo recruitment events (Junction 2026, "Rethinking Recruitment").
We turn claims into questions you can check during the conversation.

Built on the Centrale Lyon JE skills framework: 5 competencies, 12 components, 3 levels (Foundation, Intermediate, Advanced), and the rosace.

All data in this repository is synthetic.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # scoring and suggestion rules
```

No API key belongs in this repository. Keys go in the hosting environment settings.

Coding agents: read [AGENTS.md](AGENTS.md) first (rules, calculation, next steps).

## Recruiter need preview

Open `/need/new` from the home page to describe a synthetic job, answer up to four
optional context questions, and choose three major Centrale components, up to two
minor components and up to two job skills. Each selection has three level cards
with the fixed descriptor and a hand-written example placed in the job context.
The live rosace keeps job skills separate. Capacity defaults to three.

Confirming validates the need with `checkNeed()` and shows an in-page confirmation.
The draft and confirmation are saved in browser local storage and restored after
refreshing or returning. Editing a confirmed need requires confirming it again.
Use "Clear saved need and start again" to delete it. Storage failures are shown
with a retry action. Data is not sent to a server or shared across devices.
No Gemini or other AI service is used.

Validation: `npm test`, `npm run typecheck`, `npx eslint src`, `npm run build`.

## Guided experience

The home page introduces the recruiter journey. `/need/new` guides the recruiter
through four focused steps: role, priorities, expected levels and review.
The original synthetic needs, suggestions and talent cards remain at `/demo`.
See [the delivery ladder](docs/ROADMAP.md) for implemented stages, remaining work
and when database, hosting and Gemini credentials are needed.
