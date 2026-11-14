Method: dual-agent (A: impeccable_design_a · B: impeccable_technical_b)

# Rosace UX critique — 14 November 2026

Baseline: `8742471`, `feat/coherent-ux`. Mode: Operate. Assessment A reviewed the rendered product independently before Assessment B's detector findings were shared. The owner requested critique followed by frontend corrections, with no backend or functional changes.

## Verdict

Rosace has a specific identity worth preserving: the Centrale rosace, gold majors, concrete examples, declared/observed distinction and human decision sequence. The pearl Aurora, Space Grotesk and Inter are coherent. Working screens need better containment, hierarchy and density, rather than a replacement visual world.

## Design health

| Nielsen heuristic | Score / 4 | Main finding |
|---|---:|---|
| Visibility of system status | 3 | Progress and confirmations exist; status emphasis varies. |
| Match with the real world | 3 | Concrete tasks and event sequence; dense terminology needs support. |
| User control and freedom | 3 | Back/edit available; save and delete too close. |
| Consistency and standards | 2 | Density and controls differ; technical level grid overlaps. |
| Error prevention | 3 | Good selection constraints; hidden level choice undermines them. |
| Recognition rather than recall | 2 | Small charts and long mobile comparisons. |
| Flexibility and efficiency | 2 | Useful shortcuts, excessive scrolling. |
| Aesthetic and minimalist design | 2 | Nested surfaces compete with decisions. |
| Error recovery | 2 | Provisional visual assessment; full invalid-input matrix not claimed. |
| Help and documentation | 3 | Strong examples, sometimes oversized help panels. |
| **Total** | **25/40** | **Significant targeted improvements needed.** |

This is a design assessment, not an accessibility certification. No post-change score is invented.

## Eight priorities

1. **P1 — Level-card containment.** At 1440px, a 614px technical-level grid contains 886px of content. Advanced is hidden beneath the rosace. Make all three options fit their actual working column and retain every descriptor and selection.
2. **P1 — Mobile focus and task density.** Sticky actions cover the Event input at 390×844; hit-testing its centre returns Continue, even after focus. Keep actions in normal flow, remove blank tails and tighten selector/substep spacing. Preserve all actions and fields.
3. **P2 — Chart and technical metadata.** Brief labels render around 11px; a 338px aside has 421px of scroll content. Increase useful chart space without changing the level geometry; stack full names and status, and remove the inner horizontal scroller.
4. **P2 — Human observation clarity.** Skill names concatenate with “How it’s checked”; grading pills are visually weaker than optional Claude help. Separate name/method/result, provide comfortable grade targets and consistent textual status treatments. No grade or state-transition change.
5. **P2 — Working hierarchy.** Nested grey cards and repeated introductions flatten need, talent, brief and checks screens. Keep pearl working panels, quieter contextual sections and clearly selectable level cards. Maintain exact framework names, all substantive facts and existing disclosures.
6. **P1 — Accessible content.** Generic spans with aria-label hide animated 12/3 values from the accessibility tree. Expose stable text and hide only animation duplicates. Replace the hardcoded h4 in SkillBars with a labelled list and visual title.
7. **P1 — Contrast and controls.** Actual company placeholder is 2.5:1 because a legacy scoped selector wins. Correct that selector, darken gold used for text while retaining bright gold graphics, strengthen important helper text, and replace missing diagonal-arrow glyphs with existing SVG icons.
8. **P3 — Review actions.** Align Edit targets and separate saving from deleting the local talent card. Preserve current action behaviour; no additional confirmation flow.

## Users and cognitive load

Jordan, the first-time recruiter, gets a useful tour but encounters competing context, importance and level controls. Casey, working on a phone, must scroll between prompt, answer and result; obscured fields are the most serious defect. Sam, using magnification or a keyboard, faces clipped skill metadata and missing accessible counters.

The required 12 components and 20-skill catalogue create legitimate decision load. Grouping, examples and progressive disclosure help. Avoidable load comes from equal-weight nested boxes, long comparisons, small labels and oversized ancillary panels. Do not simplify by deleting the fixed framework or adding new workflow steps.

The emotional high point is seeing a declaration become a solid observed branch. The valley is repetitive selection/review work. Preserve factual reassurance and avoid celebratory or unsubstantiated recruitment claims.

## Detector and corroboration

Bundled source scan: `impeccable detect --json src`, exit 2, six warnings: five `side-tab` declarations in theme.css/workspace.css and one `gradient-text` in workspace.css. The gradient is overridden in the actual theme. Several side accents carry meaningful major/quote/status semantics. Aurora repeating-gradient warnings are an explicit framing exception, not a reason to remove the approved background.

The browser detector was injected on home, need, talent, organiser and checks. Axe and manual geometry corroborated missing accessible counters, low contrast, clipped metadata and heading-order drift. SVG button name and decorative brand tagline reports were reviewed as false positives/overstatements. No claim of a fully clean automated accessibility audit is made.

## Coverage

Fresh isolated Chromium contexts at desktop 1440px and mobile 390px: home; all four tour stages; need company/role/context/component/technical/review/saved states; talent intake/questions/summary; organiser expanded/approval/journal; fictional and approved conversations; brief preparation/observation; candidate submission and recruiter grading; `/demo`; `/practice` redirect. Additional 1024/768 checks verified level-card containment. Synthetic browser data only; no external AI calls.

All initial pages fit the document width, which did not detect internal overlap. Screenshots alone were supplemented with hit-testing and element geometry. Native screen-reader applications, real devices, Safari and live AI are outside this audit.

Questions skipped: the owner already specified the visual direction, the frontend-only constraints and implementation of the highest-impact fixes. Existing authorization takes precedence over the skill's generic follow-up questions.
