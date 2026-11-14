# Aurora Background attribution

The workspace background adapts the publicly installable **Aurora Background**
component from Aceternity UI.

- Component: https://ui.aceternity.com/components/aurora-background
- Public registry: https://ui.aceternity.com/registry/aurora-background.json
- Idea and initialization credited by the component page: Akshith Pottigari.
- Registry author: Manu Arora, Aceternity.
- Aceternity licensing: https://ui.aceternity.com/licence
- Source consulted: 14 November 2026.

This application's adaptation retains layered repeating gradients, a radial mask
and the 60-second background-position animation. Changes: shared fixed viewport
placement, light pearl surfaces, Centrale red/gold tints, soft-light blending in
place of inversion/difference, a decorative element instead of a nested `main`,
and a static reduced-motion fallback. The styles live in `src/app/theme.css` and
markup in `src/components/AuroraBackground.tsx`.

No paid shader block, Pro template, external runtime script, account or API key
is required. The adaptation is part of the Rosace end application, not a component
library or template offered for redistribution.
