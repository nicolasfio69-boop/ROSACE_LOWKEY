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
