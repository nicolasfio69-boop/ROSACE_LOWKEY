# Validation — framing delivery, 14 November 2026

On `feat/coherent-ux`, steps 0–9 from `CODEX_BRIEF.md` have one commit each. The framing, concrete-skills and guided-demo branches are integrated locally. No GitHub PR has been merged.

- After each step: `npm test`, `npx tsc --noEmit`, `npx eslint src`, `npm run build` passed.
- Final framing suite: **145 unit tests**, **17 Playwright tests**, **4 launcher tests** passed.
- Playwright covers the existing document/consent/deletion flows, exact labels, three technical skills with four minors, human grade A at the declared task level, persistent observations and their mean without changing the declaration, explicit optional AI feedback, and the four-stage guided tour.
- Seven routes captured at **1440 × 900** and **390 × 844**, without horizontal overflow or browser errors. Reduced-motion checks pass. See [images/framing-delivery](images/framing-delivery).
- Node 22 multi-stage Docker image built and served `/tour` successfully. The cloud environment required its configured proxy and a temporary BuildKit-mounted CA certificate for `npm ci`; neither was added to source or the resulting runtime image. Standard Dockerfile is intended for normal Aiven networking.
- No API credentials committed, no real paid AI calls, no deployment and no database added.

## Latest requested follow-up

After this framing validation, the owner requested Anthropic instead of Featherless and separate candidate/recruiter interfaces selected in the header. That follow-up is recorded separately below when validated. Earlier screenshots and counts above describe the framing milestone.

## Anthropic and separate-workspace follow-up

- **151 unit tests**, TypeScript, ESLint and production build pass.
- **19 Playwright tests pass against the final Node 22 Docker container**, running as UID 1000. This includes the original journeys, separate role navigation, reviewed Claude requirements, recruiter approval of generated exercises, candidate submission, human grading, versioned exercise snapshots and explicit AI feedback without automatic grades.
- Eight routes, including the separate candidate check screen, captured at 1440 × 900 and 390 × 844 with no horizontal overflow. Latest screenshots: [images/claude-workspaces](images/claude-workspaces). The earlier screenshot set is the framing milestone.
- `npm run test:claude` correctly reports missing local configuration and sends no request. **No real Anthropic call has been validated**: the key is not configured in this workspace. All provider-response tests use fixtures/mocks.
- Setup and remaining work: [CLAUDE_SETUP.md](CLAUDE_SETUP.md). No deployment, authenticated accounts or shared database is claimed.

## Impeccable frontend refinement

- Two independent visual and technical audits covered every visible route and principal workflow states. Baseline design assessment: **25/40**, with eight prioritized corrections; [full critique](UX_AUDIT_IMPECCABLE.md).
- **151 unit tests**, TypeScript, ESLint and production build pass. The launcher remains unchanged from its four passing tests above.
- **22 Playwright tests** pass against the production build. Three new regressions check unobscured focused mobile inputs, all three technical-level choices within their panel, accessible counters, chart-label bounds and complete technical metadata at 1440, 1024, 768, 390 and 320px.
- Existing tests still verify document privacy, persistence/deletion, the fixed framework, keyboard rosace selection, mean observations, human grading, explicit AI proposal acceptance and reduced motion.
- Desktop/mobile captures and local launch instructions: [UI_REVIEW.md](UI_REVIEW.md). Visual checks include level selection, observation rows and review controls, not only initial pages.
- UI-only changes are isolated after `8742471`: no edits to API routes, business libraries, schemas, scoring, authentication or database code. No actual Anthropic request, deployment or PR merge was performed.

## Welcome and challenge-alignment follow-up

- **159 unit tests**, TypeScript, ESLint and production build pass. Eight new unit cases check role destinations, exact preference validation and denied browser storage.
- **26 Playwright tests** pass against the standalone production build. Four new scenarios cover the fictional email/code preview, wrong-code recovery, no identity or code in storage, no sign-in POST, returning visits, direct demo access, all three roles, storage denial, keyboard controls and Escape dismissal.
- Existing journeys now use the profile menu and still exercise explicit AI acceptance, human grades and preserved check selections. The saved-card test also checks the candidate home shows the saved declaration, without inventing an observation. The route matrix includes all three new homes and the preserved overview.
- New flow states fit 1440, 768, 390 and 320px without horizontal overflow or client errors. Desktop/mobile screenshots: [WELCOME_REVIEW.md](WELCOME_REVIEW.md).
- Axe reports no WCAG A/AA violations on the new welcome/sign-in/code states and the three homes/profile menu at desktop and mobile after matching accessible control names to their visible text. This is a scoped automated check, not certification. The four welcome regressions were rerun after the final logo-label correction.
- The Impeccable source detector reports the same six existing style warnings documented in the previous milestone, none in the new welcome stylesheet/components. The fixed pearl Aurora identity is preserved.
- [CHALLENGE_ALIGNMENT.md](CHALLENGE_ALIGNMENT.md) maps the framing and original six-page Espoo PDF to implemented behaviour, prototype limits and validation still needed. It does not claim measured recruitment impact, live AI quality, real authentication or legal certification.
- No API routes, scoring, business storage, schemas, auth service or database changed; the added local preference stores only a navigation mode. No email sent, real API call, deployment or PR merge.

## Automatic demo and timed verification follow-up

- **166 unit tests**, TypeScript, ESLint and production build pass. Tests cover all 26 online skills at three levels, relevant 20-minute plans, rejected over-budget changes, attempt snapshots and timing, stale-review rejection and advisory grade validation against exact answer quotes.
- **33 Playwright tests** pass against the standalone production build. Seven new cases cover playback/pause/end without API calls or workspace writes, timer expiry without automatic submission or grading, shared recruiter/candidate plans, and every demo moment plus timed input at 1440, 768, 390 and 320px.
- The existing Claude regression now verifies that a recommendation leaves observations empty until explicit human validation, and that the recruiter can replace the suggested grade. Existing declaration, privacy, retention/deletion, mean observation and role separation checks still pass.
- Desktop/mobile screenshots and usage instructions: [DEMO_CHECKS_REVIEW.md](DEMO_CHECKS_REVIEW.md). Manual review prompted a focused answer screen and a readable single observed rosace in the final demo chapter.
- Axe reports no WCAG A/AA violations in fourteen rendered checks: four demo chapter states, candidate preparation, a timed answer and recruiter review at desktop and mobile. This remains a scoped automated check, not an accessibility certification. Impeccable's source detector reports only the six existing style warnings recorded above.
- This owner-requested functional follow-up adds browser check plans, advisory timing metadata, expanded written tasks and Claude's advisory recommendation. It changes no framework labels, matching formula, scoring weights, observation mean or C4.3 exclusion. No real API call, credential commit, deployment, authenticated service or PR merge.
