import {
  LEVELS,
  skillName,
  type ExpectedLevel,
  type LevelValue,
} from "@/lib/framework";
import { RED } from "./Rosace";

/**
 * Technical skills, drawn next to the rosace with the same reading:
 * one bar per skill on the same three levels (Foundation, Intermediate, Advanced).
 * Need only: a solid bar up to the expected level.
 * Talent: dotted bar while declared, solid once observed, black tick at the expected level.
 * No bar means "not filled in", never zero.
 */
export type SkillBarItem = {
  code: string;
  expected?: ExpectedLevel;
  level?: LevelValue | null;
  observed?: boolean;
  observedValue?: number | null;
  /** Mentioned in the CV but not detailed yet. */
  mentioned?: boolean;
};

export function SkillBars({
  items,
  title = "Technical skills",
}: {
  items: SkillBarItem[];
  title?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h4>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item.code}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span>{skillName(item.code)}</span>
              <span className="shrink-0 text-xs text-muted">
                {status(item)}
              </span>
            </div>
            <Track item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Track({ item }: { item: SkillBarItem }) {
  const talentShown =
    item.level !== undefined ||
    item.mentioned ||
    item.observedValue !== undefined;
  const value =
    item.observedValue !== undefined
      ? item.observedValue
      : talentShown
        ? item.level
        : item.expected;
  const width = typeof value === "number" ? `${(value / 3) * 100}%` : "0%";
  const dotted =
    talentShown && !item.observed && item.observedValue === undefined;
  return (
    <div
      className="relative mt-1 h-3 rounded-sm bg-[#E8E8E8]"
      aria-hidden="true"
    >
      {[1, 2].map((step) => (
        <span
          key={step}
          className="absolute top-0 h-full border-l border-dashed"
          style={{
            left: `${(step / 3) * 100}%`,
            borderColor: RED,
            opacity: 0.4,
          }}
        />
      ))}
      {typeof value === "number" && value > 0 ? (
        <span
          className="absolute left-0 top-0 h-full rounded-sm"
          style={{
            width,
            background: dotted
              ? `repeating-linear-gradient(90deg, ${RED} 0 6px, transparent 6px 10px)`
              : RED,
          }}
        />
      ) : null}
      {talentShown && item.expected ? (
        <span
          className="absolute -top-1 h-5 w-[3px] -translate-x-1/2 rounded bg-ink"
          style={{ left: `${(item.expected / 3) * 100}%` }}
        />
      ) : null}
    </div>
  );
}

function status(item: SkillBarItem): string {
  const talentShown =
    item.level !== undefined ||
    item.mentioned ||
    item.observedValue !== undefined;
  if (!talentShown)
    return item.expected ? `expects ${LEVELS[item.expected].name}` : "";
  if (item.observedValue !== undefined)
    return item.observedValue === null
      ? "Not observed"
      : `Observed ${Number(item.observedValue.toFixed(2))} / 3`;
  const declared =
    item.level === null || item.level === undefined
      ? "mentioned in CV, not detailed"
      : LEVELS[item.level].name;
  return item.expected
    ? `${declared} · expects ${LEVELS[item.expected].name}`
    : declared;
}
