import type { ExpectedLevel } from "./framework";
import { observedValue, type Observation } from "./scoring";

/** Every observation uses its task level; legacy entries use the need level. */
export function meanObservedValue(
  entries: readonly { taskLevel?: ExpectedLevel; observation: Observation }[],
  legacyTaskLevel: ExpectedLevel,
): number | null {
  const values = entries
    .map((s) => observedValue(s.taskLevel ?? legacyTaskLevel, s.observation))
    .filter((v): v is number => v !== null);
  return values.length
    ? values.reduce((sum, v) => sum + v, 0) / values.length
    : null;
}

/** Same origin and scale for expected, declared and observed branches. */
export function radialLevel(
  level: number,
  hub: number,
  radius: number,
): number {
  return hub + (Math.max(0, Math.min(3, level)) / 3) * (radius - hub);
}
