# Instructions for coding agents (Codex, ChatGPT, Claude, Cursor)

Read this file fully before changing anything. It is the short version of the project's reference document.

## The project in five lines

- Junction 2026, challenge "Rethinking Recruitment" by the City of Espoo. Working name: **Rosace**.
- Matchmaking for Espoo recruitment events (in person, online, sometimes hybrid).
- Promise: **"We turn claims into questions you can check during the conversation."** Never claim the tool detects inflated CVs or proves a skill.
- The **recruiter is the hero of the demo**. A human always decides: the tool only suggests.
- Judging: impact 45 %, innovation and UX 35 %, responsible and feasible execution 20 %.

## Rules you must not break

1. **The Centrale system is fixed**: 5 competencies, 12 components, 3 levels (Foundation, Intermediate, Advanced, plus "Not yet"), and the rosace. Do not add, remove or rename components without the owner's approval. See `src/lib/framework.ts`.
2. **Keep it simple.** No allocation algorithm, no waitlist, no ranking shown to talents, no percentages on screen. If a feature is not in "Next steps" below, ask first.
3. **Synthetic data only.** No real person, no real company. Never search the web for a talent.
4. **No bias inputs**: never use nationality, language, age, gender or degree name in a calculation. Communication is judged on being understood, never on accent or grammar.
9. **Descriptors stay concrete**: each one must be checkable by asking "tell me about a time when...". No reputation ("others rely on them"), no personality trait. Same ladder everywhere: 1 with help on a simple case, 2 alone on a real case, 3 alone when the situation is new or changing and others depend on the result.
5. **No API key in the repository.** Keys go in the hosting environment settings (Vercel). `.env*` is git-ignored.
6. **The CV is never stored**, not even in AI logs. A talent card is kept 6 months only if the talent asks, and can be deleted anytime.
7. Product language is **English**. Code, comments and UI in English.
8. Every change keeps `npm test`, `npx tsc --noEmit`, `npx eslint src` and `npm run build` passing.

## The rules of the calculation (already coded, tested)

A company need has, like in the Centrale tool:
- **exactly 3 major components** (weight 2), drawn **in gold, on top** of the rosace;
- **up to 2 minor components** (weight 1), drawn in red;
- **up to 2 job skills** (weight 2) on top of the Centrale base, shown next to the rosace, never as majors.
`checkNeed()` in `src/lib/scoring.ts` enforces this.

Alignment of a talent with a need:
- points = weight × min(declared level, expected level). Being above the expected level earns nothing, but is shown.
- shown as a fraction, for example "13 out of 19". Never a percentage.
- coverage = weight of filled-in requirements / total weight. **Complete at 70 %** (Centrale threshold).
- a CV mention without detail counts as unknown, not as a level.
- majors and job skills that are unknown or below expectation are listed apart ("to check").
- evidence (declared, situation, supported link) is displayed but never changes the points.

Suggestions (`src/lib/suggestions.ts`):
- eligible = complete card and at least Foundation on one major;
- sorted by points; capacity is how many people the recruiter wants to meet (default 3);
- **a tie at the cut is never broken**: tied talents go to the organiser;
- talents with no suggestion are listed with the reason, so the organiser sees them before approving.

Observation after the meeting (Centrale grid): A "Seen clearly" = 1, C "Seen in part" = 0.6, F "Not seen" = 0, NE "Not covered" = nothing. Observed value = level × performance, stored apart from the declared value, never added to it.

## The rosace (`src/components/Rosace.tsx`)

Drawn like the Centrale Lyon JE tool: grey disk, red dashed axes and outer circle, thick round bars, the 3 majors in gold drawn last (on top). Fixed scale: disk edge = Foundation, inner ring = Intermediate, outer circle = Advanced. Talent bar dotted = declared, solid = observed by a recruiter. When a talent is shown against a need, a black tick marks the expected level. An empty branch means "not filled in", never zero. The logo (`src/components/Logo.tsx`) is a small rosace with 3 gold branches on top.

## What exists

- `src/lib/framework.ts`: the 12 components in English with descriptors per level, 5 job skills.
- `src/lib/scoring.ts`, `src/lib/suggestions.ts`: the rules above. Tests in `src/lib/scoring.test.ts`.
- `src/data/demo.ts`: event "Espoo Tech Matchmaking", 2 needs (NordChip embedded developer, Lumora support engineer), 6 talents.
- `src/app/page.tsx`: overview page (needs, suggestions, talents without suggestion, talent rosaces).

## Next steps, in this order

Build each step on its own branch with a pull request. Keep the demo data working at every step.

1. **Screen 1, recruiter need** (`/need/new`): the recruiter types the job title and a short description; at most 4 questions to understand the job; then picks 3 majors and up to 2 minors from the 12 components (cards), up to 2 job skills from a closed list, and an expected level for each. Each level shows a **level card**: the fixed Centrale descriptor plus an example adapted to the job (hand-written for now, Gemini later). A live rosace shows the gold majors as they are picked. Capacity defaults to 3. Use `checkNeed()` to block an invalid need.
2. **Screen 2, talent card from CV** (`/talent/new`): the talent pastes a CV (not stored). Skills are spotted with the CV sentence quoted (hand-written rules or demo stub now, Gemini later). For each skill, three closed questions: done it? alone or with help? simple or new situation? A written rule suggests the level; the talent confirms or changes it. The talent sees only their rosace and grids, never a rank or a fraction.
3. **Organiser gesture** (`/organiser`): sees suggestions per need, ties, talents without suggestion and why; approves, adds or removes a talent with a one-line reason; every action goes to a journal.
4. **Screen 3, brief and observation** (`/brief/[need]/[talent]`): why talk, 3 to 5 questions to verify the claims, what a good answer contains, talent rosace over the need. After the meeting the recruiter fills the A / C / F / NE grid; observed bars become solid.
5. Storage (Aiven PostgreSQL in Finland, or Supabase as fallback), then deploy on Vercel.
6. Gemini for: need questions, level-card examples, CV spotting, brief questions. AI output is always checked against the closed list of skills and shown to a human before use.

## Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest
npx tsc --noEmit
npx eslint src
npm run build
```

Note: the planning document "Version simple" still shows the older example "11 out of 15" where a job skill was a major. The code and this file are the newer rule (3 major components, job skills apart).
