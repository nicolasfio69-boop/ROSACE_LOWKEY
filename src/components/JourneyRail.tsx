import { COMPONENTS, COMPETENCIES } from "@/lib/framework";
export function JourneyRail({
  index,
  onSelect,
  selected,
}: {
  index: number;
  onSelect: (i: number) => void;
  selected: string[];
}) {
  return (
    <nav className="journey-rail" aria-label="Twelve component journey">
      <p className="eyebrow">EXPLORE ALL 12 COMPONENTS</p>
      {COMPETENCIES.map((group) => (
        <div key={group.code}>
          <p className="rail-group">{group.name}</p>
          {COMPONENTS.map((c, i) =>
            c.competency === group.code ? (
              <button
                key={c.code}
                type="button"
                className={i === index ? "active" : ""}
                aria-current={i === index ? "step" : undefined}
                onClick={() => onSelect(i)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {c.short}
                {selected.includes(c.code) && <i className="gold-dot" />}
              </button>
            ) : null,
          )}
        </div>
      ))}
    </nav>
  );
}
