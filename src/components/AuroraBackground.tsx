/**
 * Adapted from Aceternity UI's freely available Aurora Background component.
 * https://ui.aceternity.com/components/aurora-background
 * Original idea: Akshith Pottigari; registry author: Manu Arora.
 * Uses the repeating-gradient layers and radial mask, with a light Centrale
 * palette, softer blending, one shared viewport background and reduced motion.
 * No Pro block, remote script, canvas or API is used.
 */
export function AuroraBackground() {
  return (
    <div className="aurora-background" aria-hidden="true">
      <div className="aurora-layer" />
    </div>
  );
}
