# Instructions for coding agents (Codex, ChatGPT, Claude, Cursor)

Read this file fully before changing anything. It is the short version of the project's reference document.

**First read `docs/CADRAGE.md`** (in French): it is the up-to-date framing document with every decision and the open questions. If this file and `docs/CADRAGE.md` disagree, `docs/CADRAGE.md` wins. Never settle an open question yourself: propose options and let the owner decide.

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
9. **Rosace labels start with an action verb** (Reach out, Convince, Follow the rules...).
10. **Descriptors stay concrete**: each one must be checkable by asking "tell me about a time when...". No reputation ("others rely on them"), no personality trait. Same ladder everywhere: 1 with help on a simple case, 2 alone on a real case, 3 alone when the situation is new or changing and others depend on the result.
5. **No API key in the repository.** Keys go in the hosting environment settings (Aiven Runtime). `.env*` is git-ignored.
6. **The CV is never stored**, not even in AI logs. A talent card is kept 6 months only if the talent asks, and can be deleted anytime.
7. Product language is **English**. Code, comments and UI in English.
8. Every change keeps `npm test`, `npx tsc --noEmit`, `npx eslint src` and `npm run build` passing.

## The rules of the calculation (already coded, tested)

A company need has, like in the Centrale tool:
- **exactly 3 major components** (weight 2), drawn **in gold, on top** of the rosace;
- **as many minor components as the job needs** (weight 1), drawn in red, as in the Centrale grid;
- **up to 3 technical skills** (weight 2) on top of the Centrale base, from a catalog grouped by job family (`JOB_FAMILIES`, `JOB_SKILLS` in `src/lib/framework.ts`), shown as bars next to the rosace (`SkillBars`), never as majors.
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

Observation after the meeting (Centrale grid): A "Seen clearly" = 1, C "Seen in part" = 0.6, F "Not seen" = 0, NE "Not covered" = nothing. Observed value = task level × performance, stored apart from the declared value, never added to it. Multiple situations use the mean of their observed values (NE excluded, F included as zero), as approved by the owner. Regrading a situation replaces its grade.

## The rosace (`src/components/Rosace.tsx`)

Drawn like the Centrale Lyon JE tool: grey disk, red dashed axes and outer circle, thick round bars, the 3 majors in gold drawn last (on top). Fixed scale: disk edge = Foundation, inner ring = Intermediate, outer circle = Advanced. Talent bar dotted = declared, solid = observed by a recruiter. When a talent is shown against a need, a black tick marks the expected level. An empty branch means "not filled in", never zero. The logo (`src/components/Logo.tsx`) is a small rosace with 3 gold branches on top.

## What exists

- `src/lib/framework.ts`: the 12 components in English with descriptors per level, 20 technical skills in 4 families.
- `src/lib/scoring.ts`, `src/lib/suggestions.ts`: the rules above. Tests in `src/lib/scoring.test.ts`.
- `src/data/demo.ts`: event "Espoo Tech Matchmaking", 2 needs (NordChip embedded developer, Lumora support engineer), 6 talents.
- `/`: role choice and explicitly fictional sign-in preview, with direct demo access. `/candidate`, `/recruiter`, `/event`: role homes; `/overview`: previous workspace overview; `/tour`: four-step guided demo (welcome header, Demo profile menu, quiet link on role homes — not in the role sidebar); `/demo`: original synthetic overview, outside the menu.
- `/need/new`: progressive company/role context, interactive 12-component rosace, level cards, browser draft and confirmation.
- `/talent/new`: on-device document parsing, quoted clues, factual questions and confirmed declarations. CVs remain transient.
- `/organiser`: company selection, suggestions, human decisions and journal. `/conversations` opens approved or clearly labelled fictional conversations.
- `/brief?need=...&talent=...`: tailored discussion gaps, role examples and separate A/C/F/NE observations. The query-based URL replaces the originally planned dynamic path.
- `/checks` (`/practice` redirects): 26 self-contained fictional online exercises (6 Centrale components and 20 technical skills), three levels each. Recruiters select a plan of at most 20 minutes; candidates explicitly start a timed attempt and submit. Claude may recommend A/C/F/NE with quoted criteria, but only an explicit recruiter decision records a grade. Answers stay in the browser; re-submission clears the previous grade. C4.3 is discussed, never marked observed.
- Optional server-only Context.dev and Claude (Anthropic) adapters are implemented but live calls await credentials. Company-site collection was explicitly requested by the owner; never search for a talent.
- `start-local.cmd` / `npm run local`: install dependencies when necessary, start the app and open the browser. Cursor is optional.
- See `docs/ROADMAP.md` for current delivery status. Storage remains local to one browser; no deployed service or authenticated accounts.

## Next steps, in this order

The following is the original implementation sequence; screens 1–4 now exist, as listed above. Build further changes on their own branch with a pull request. Keep the demo data working at every step.

1. **Screen 1, recruiter need** (`/need/new`): the recruiter types the job title and a short description; at most 4 questions to understand the job; then picks 3 majors and any number of minors from the 12 components (cards), up to 3 technical skills from a closed list grouped by job family, and an expected level for each. Each level shows a **level card**: the fixed Centrale descriptor plus an example adapted to the job (hand-written defaults and optional Claude proposals). A live rosace shows the gold majors as they are picked. Capacity defaults to 3. Use `checkNeed()` to block an invalid need.
2. **Screen 2, talent card from CV** (`/talent/new`): the talent pastes a CV (not stored). Skills are spotted with the CV sentence quoted (on-device rules; no CV is sent to Claude). For each skill, three closed questions: done it? alone or with help? simple or new situation? A written rule suggests the level; the talent confirms or changes it. The talent sees only their rosace and grids, never a rank or a fraction.
3. **Organiser gesture** (`/organiser`): sees suggestions per need, ties, talents without suggestion and why; approves, adds or removes a talent with a one-line reason; every action goes to a journal.
4. **Screen 3, brief and observation** (`/brief/[need]/[talent]`): why talk, 3 to 5 questions to verify the claims, what a good answer contains, talent rosace over the need. After the meeting the recruiter fills the A / C / F / NE grid; observed bars become solid.
5. Deploy a standalone Next.js container on Aiven Runtime. Keep storage in the browser for now; do not add PostgreSQL.
6. Claude for: need requirements, level-card examples, contextual exercises and recruiter feedback. CV spotting remains on-device. AI output is always checked against the closed list of skills and shown to a human before use.

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

## Latest owner decision: Anthropic and separate workspaces

All AI calls now use the Anthropic Messages API (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`), never Featherless or Gemini. RAG retrieves only reviewed company/job passages; CVs stay out. Requirements, level details and exercises are proposals for human review. For submitted online answers, the latest owner decision allows a separate advisory A/C/F/NE recommendation with quoted evidence; it never records an observation until the recruiter validates or chooses a grade. The first-visit welcome selects Candidate (`/candidate`, `/talent/new`, `/talent/checks`), Recruiter (`/recruiter`, `/need/new`, `/checks`, conversations) or Organiser (`/event`, `/organiser`). The header’s Demo profile menu switches spaces. Returning visits remember a local navigation preference. Email/code sign-in is a skippable, explicitly fictional preview; no emails, accounts or permissions are implemented. Real sign-in and organiser invitations come after flow validation. These are separate demo interfaces, not authenticated accounts. A submitted answer snapshots the approved exercise; later drafts do not change it. See `docs/CLAUDE_SETUP.md`.

## Latest follow-up: automatic demo and timed verification

The owner asked for a prefilled, automatic three-minute `/tour`. Its fictional recorded decisions and illustrative AI recommendation never call an API or write the workspace. Pause, replay and chapter/moment controls remain available; reduced-motion mode starts paused.

All skills whose verification mode includes online have three hand-written task variants. Online plans remain within the existing 20-minute framing budget. The browser timer stops writing at the deadline and leaves explicit submission available; drafts remain transient and the timer is not an exam-security mechanism. On-site situations keep their shared ten-minute allowance; C4.3 remains discussed, never observed. This functional follow-up supersedes the earlier UI-only scope and the earlier ban on AI *recommendations*, not the requirement that final grades are human decisions.
