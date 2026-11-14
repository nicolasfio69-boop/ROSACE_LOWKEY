# Interactive workspace — current delivery

Latest frontend audit, corrections and screenshots: [UI_REVIEW.md](UI_REVIEW.md).
Use `feat/coherent-ux` (PR #11), which integrates `framing-doc`, `workspace-concrete-skills` and `guided-demo`. The audit-only branch does not contain this implementation. No PR has been merged on GitHub.

```bash
git fetch origin
git switch feat/coherent-ux
git pull --ff-only origin feat/coherent-ux
npm ci
npm run dev
```

Open http://localhost:3000. In Bash use `npm`; on Windows `npm.cmd` is useful only if PowerShell blocks the npm script. Node 22.13+ is required; the deployment container uses Node 22. Install dependencies once and after lockfile changes.

## Separate workspaces

Choose **View as** in the header. Candidate navigation contains the talent card and My checks (`/talent/checks`); recruiter navigation contains the need, exercise preparation/review (`/checks`) and conversations. Organiser navigation keeps the event desk. The logo opens the overview and the guided tour remains available. These are demo workspaces, not authenticated permissions.

The need journey collects company, job and working context, then uses twelve exact action labels, three majors, any minors and up to three technical skills from the twenty-skill catalogue. Technical bars sit beside the rosace. Contextual level cards explain real work; unknown is never zero. The candidate card restores consented declarations without restoring CV text and can be deleted.

The event desk shows reasons, ties and people without suggestions. The brief shows relevant questions and on-site situations. Human observations use the mean of task-level performance values, excluding NE and including F as zero. C4.3 is discussed, never marked observed. Declared levels stay separate.

## Claude and review

Claude retrieves reviewed job/company passages to propose requirements, level examples and exercises. Sources and reasons are visible. The recruiter must accept a proposal before it changes requirements or becomes an exercise. Three demo skills have three versions each, with a twenty-minute total budget. Other verification tasks are described in the plan but not implemented as online exercises.

Candidates submit from their own screen. Recruiters review the saved exercise version and answer, optionally request Claude feedback, then personally give A/C/F/NE. Replacing an answer clears its old grade. Submitted fictional answers persist locally; CVs do not. See [CLAUDE_SETUP.md](CLAUDE_SETUP.md) for keys, the real API connection test and remaining work.

## Visual design

All roles share a pearl background and matching navigation, fields and panels. Centrale red and gold are the strong colours; Space Grotesk and Inter are bundled locally. Free Aceternity adaptations provide a full-screen Aurora, word reveal, card glow and discreet header beams. Rosace construction, solid observed fills, arriving suggestions, transitions and counters explain progress; reduced-motion preferences make them static. See [ACETERNITY_ATTRIBUTION.md](ACETERNITY_ATTRIBUTION.md).

On mobile, navigation and role selection stay in the header; the live rosace is a compact sticky disclosure. Interactive rosace branches support mouse, Tab, arrows and Enter. Form errors, save status and unsupported document errors are visible next to the relevant work.

## Validation and limits

See [VALIDATION.md](VALIDATION.md) for checks and screenshot sets. Browser-local storage does not sync across computers. API responses are tested with mocks until the owner's key is configured; no live AI result, deployed Aiven URL or authenticated service is claimed. Aiven Runtime packaging is prepared in [DEPLOY_AIVEN.md](DEPLOY_AIVEN.md), without PostgreSQL.
