import { COMPETENCIES, COMPONENTS, type ExpectedLevel, type LevelValue } from "@/lib/framework";

/**
 * The rosace: one branch per Centrale component.
 * Dashed branch = declared by the talent. Solid branch = observed by a recruiter.
 * An empty branch means "not filled in", never zero.
 * A need is drawn as gold marks at the expected level (thick for a major requirement).
 */
export type RosaceProps = {
  declared?: Partial<Record<string, LevelValue | null>>;
  observed?: Partial<Record<string, boolean>>;
  expected?: Partial<Record<string, { level: ExpectedLevel; major: boolean }>>;
  size?: number;
  title?: string;
};

const GOLD = "#D4A000";
const RING = "#C9C9D1";

export function Rosace({ declared = {}, observed = {}, expected = {}, size = 280, title }: RosaceProps) {
  const margin = Math.round(size * 0.2);
  const center = size / 2;
  const radius = size / 2 - margin;
  const inner = radius * 0.14;
  const width = Math.max(4, size / 34);
  const font = Math.max(9, Math.round(size / 26));
  const colorOf = (competency: string) => COMPETENCIES.find((c) => c.code === competency)?.color ?? "#555";
  const at = (level: number) => inner + (level / 3) * (radius - inner);

  return (
    <figure className="flex flex-col items-center">
      {title ? <figcaption className="mb-1 text-sm font-semibold">{title}</figcaption> : null}
      <svg
        viewBox={`${-margin} 0 ${size + 2 * margin} ${size}`}
        width={size + 2 * margin}
        height={size}
        className="h-auto max-w-full"
        role="img"
        aria-label={title ? `Rosace: ${title}` : "Rosace"}
      >
        {[1, 2, 3].map((level) => (
          <circle key={level} cx={center} cy={center} r={at(level)} fill="none" stroke={RING} strokeDasharray="2 3" />
        ))}
        {COMPONENTS.map((component, index) => {
          const angle = -Math.PI / 2 + (index * 2 * Math.PI) / COMPONENTS.length;
          const point = (distance: number) => ({
            x: round(center + distance * Math.cos(angle)),
            y: round(center + distance * Math.sin(angle)),
          });
          const start = point(inner);
          const edge = point(radius);
          const level = declared[component.code];
          const want = expected[component.code];
          const label = point(radius + font * 1.6);
          const anchor = Math.abs(Math.cos(angle)) < 0.2 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";

          return (
            <g key={component.code}>
              <line x1={start.x} y1={start.y} x2={edge.x} y2={edge.y} stroke={RING} strokeWidth={1} />
              {typeof level === "number" && level > 0 ? (
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={point(at(level)).x}
                  y2={point(at(level)).y}
                  stroke={colorOf(component.competency)}
                  strokeWidth={width}
                  strokeDasharray={observed[component.code] ? undefined : `${width * 1.2} ${width * 0.8}`}
                />
              ) : null}
              {level === 0 ? <circle cx={start.x} cy={start.y} r={width / 2} fill={colorOf(component.competency)} /> : null}
              {want ? <ExpectedMark center={center} angle={angle} distance={at(want.level)} major={want.major} size={size} /> : null}
              <text
                x={label.x}
                y={label.y}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={font}
                fill={want ? "#1c1c20" : "#6e6e78"}
                fontWeight={want?.major ? 700 : 400}
              >
                {component.short}
              </text>
            </g>
          );
        })}
        <circle cx={center} cy={center} r={inner * 0.8} fill="#fff" stroke={RING} />
      </svg>
    </figure>
  );
}

function ExpectedMark({
  center,
  angle,
  distance,
  major,
  size,
}: {
  center: number;
  angle: number;
  distance: number;
  major: boolean;
  size: number;
}) {
  const half = size / 40;
  const x = center + distance * Math.cos(angle);
  const y = center + distance * Math.sin(angle);
  const dx = -Math.sin(angle) * half;
  const dy = Math.cos(angle) * half;
  return (
    <line
      x1={round(x - dx)}
      y1={round(y - dy)}
      x2={round(x + dx)}
      y2={round(y + dy)}
      stroke={GOLD}
      strokeWidth={major ? 4 : 2}
      strokeLinecap="round"
    />
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
