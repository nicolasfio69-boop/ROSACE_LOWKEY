/**
 * Our mark: a small rosace. Twelve red branches (the 12 Centrale components),
 * three gold branches on top (the three majors a company picks).
 */
const RED = "#C8102E";
const GOLD = "#F0C300";
const TOP = new Set([11, 0, 1]);
const LENGTHS = [1, 0.62, 0.8, 0.55, 0.72, 0.5, 0.66, 0.52, 0.78, 0.58, 0.7, 1];

export function LogoMark({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const hole = r * 0.2;
  const ray = (index: number) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 6;
    const gold = TOP.has(index);
    const length = gold ? r : hole + (r - hole) * LENGTHS[index] * 0.85;
    return (
      <line
        key={index}
        x1={round(cx + hole * Math.cos(angle))}
        y1={round(cy + hole * Math.sin(angle))}
        x2={round(cx + length * Math.cos(angle))}
        y2={round(cy + length * Math.sin(angle))}
        stroke={gold ? GOLD : RED}
        strokeWidth={round(r * (gold ? 0.2 : 0.13))}
        strokeLinecap="round"
      />
    );
  };
  const order = [...Array(12).keys()].sort(
    (a, b) => Number(TOP.has(a)) - Number(TOP.has(b)),
  );
  return <g aria-hidden="true">{order.map(ray)}</g>;
}

export function Logo({
  size = 40,
  name = "Rosace",
}: {
  size?: number;
  name?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <LogoMark cx={50} cy={50} r={46} />
      </svg>
      <span
        className="font-bold tracking-tight"
        style={{ color: RED, fontSize: size * 0.6 }}
      >
        {name}
      </span>
    </span>
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
