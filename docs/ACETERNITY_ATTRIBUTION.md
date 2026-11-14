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

## Free component adaptations added on 14 November 2026

- **Glowing Effect** — https://ui.aceternity.com/components/glowing-effect — `src/components/GlowingEffect.tsx`, already present on the imported design branch, now mounted on the overview cards. Pointer-following border, recoloured red and gold; disabled for reduced motion.
- **Text Generate Effect** — https://ui.aceternity.com/components/text-generate-effect — public source https://ui.aceternity.com/registry/text-generate-effect.json consulted on 14 November 2026. `src/components/TextGenerateEffect.tsx` keeps the staggered word opacity/blur reveal with CSS instead of Motion, preserves an accessible complete title and becomes static for reduced motion.
- **Background Beams** — https://ui.aceternity.com/components/background-beams — public source https://ui.aceternity.com/registry/background-beams.json consulted on 14 November 2026. `src/components/BackgroundBeams.tsx` reduces the source's curves to four, uses unique gradient IDs, red/gold and CSS dash motion. Decorative, non-interactive and static for reduced motion.

These are adaptations of the free public components, not paid shader blocks. No new runtime dependency, remote font, account or API key is required. Count-up and rosace construction animations are local implementations.
