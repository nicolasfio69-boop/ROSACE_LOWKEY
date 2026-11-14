---
name: rosace-ux-audit
description: Audit the Rosace web app's UX screen by screen for the Junction Espoo demo and return a ranked list of concrete fixes. Use when asked to audit, review or criticise the UX, UI, flow or copy of the site.
---

# Rosace UX audit

You audit the UX of Rosace, a Next.js app built for Junction 2026, City of Espoo
challenge "Rethinking Recruitment". Read `AGENTS.md` and `docs/VISUAL_WORKSPACE.md`
first. Do not change code during the audit: report first, the team decides.

## What the product must do in a 3-minute demo

1. A recruiter prepares a need: 3 major Centrale components (gold), any minors
   (red), up to 3 technical skills, an expected level for each.
2. A talent builds a skills card from a CV. Declared levels are dotted on the rosace.
3. The organiser sees suggestions with their reasons, ties at the cut and people
   without a suggestion, and decides.
4. The recruiter prepares the conversation and records what was observed (solid bar).

The recruiter is the hero of the demo. Judging: impact 45 %, innovation and UX 35 %,
responsible and feasible 20 %.

## Fixed rules: never propose to break them

- The Centrale system stays: 5 competencies, 12 components, the levels, the rosace.
- A person always decides. No automatic ranking shown to talents, no score to talents.
- No nationality, language, age, gender or degree used to suggest anyone.
- Synthetic data only. The CV is never stored.
- Product UI in English. Following the owner’s approved update, use a continuous light
  pearl Aurora background and matching surfaces, with Centrale red `#C8102E` and
  gold `#F0C300` accents; no serif, green or marketing slogans.

## How to run it

```
npm ci
npm run dev
```

Open http://localhost:3000. Screens: `/`, `/candidate` or `/recruiter`, `/need/new`,
`/talent/new`, `/organiser`, `/checks`, `/conversations`,
`/brief?need=nordchip-embedded&talent=amira`, `/tour`, `/demo`.
The 3-minute demo is not in the role sidebar; open it from welcome or Demo profile.
If you can drive a browser, take screenshots at 1440 x 900 and 390 x 844.

## Audit grid, for every screen

- **5-second test:** can a first-time judge say what the screen is for and what to do next?
- **Demo path:** how many clicks and fields from the home page to a confirmed need,
  a saved talent card, an approved meeting and a recorded observation? Flag every
  step that is not needed for the demo.
- **Copy:** vague or abstract sentences, jargon, text that explains instead of
  showing, tiny text (under 12 px), walls of text.
- **Hierarchy:** one primary action per screen, clear titles, what is gold vs red,
  declared vs observed is readable without a legend.
- **Feedback:** empty, loading, error and success states; what happens after a click.
- **Scope:** screens or features that do not serve the 4 demo steps (for example the
  Practice studio): keep, hide or cut?
- **Accessibility:** contrast, keyboard use of the rosace, focus visible, reduced motion.
- **Mobile 390 px:** no horizontal scroll, buttons reachable, rosace legible.

## Output

1. One sentence verdict per screen.
2. The top 10 problems ranked by impact on the demo, as a table:
   screen · problem · evidence (what you saw, file and line if relevant) · fix ·
   effort (S, M, L).
3. A proposed demo path in at most 8 steps.
4. What to cut or hide before the pitch.

Be concrete and blunt. No generic advice that would apply to any website.
