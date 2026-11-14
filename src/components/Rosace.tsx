"use client";
import {
  COMPONENTS,
  type ExpectedLevel,
  type LevelValue,
} from "@/lib/framework";
import { LogoMark } from "./Logo";

/**
 * The rosace, drawn like the Centrale Lyon JE tool:
 * grey disk, red dashed axes and outer circle, one thick round bar per component,
 * the three major components in gold, drawn on top of the others.
 *
 * Our additions, kept discreet:
 * - fixed scale: grey disk edge = Foundation, inner dashed ring = Intermediate, outer circle = Advanced;
 * - a talent's bar is dotted while declared, solid once a recruiter observed it;
 * - when a need is shown with a talent, a black tick marks the level the company expects.
 * An empty branch means "not filled in", never zero.
 */
export type RosaceProps = {
  /** Talent levels, as declared on the card. */
  declared?: Partial<Record<string, LevelValue | null>>;
  /** Numeric observation values, kept separate from the declared card. */
  observedLevels?: Partial<Record<string, number | null>>;
  /** Components a recruiter has observed: the bar becomes solid. */
  observed?: Partial<Record<string, boolean>>;
  /** Levels a company expects. Drawn as bars when no talent is given, as ticks otherwise. */
  expected?: Partial<Record<string, { level: ExpectedLevel; major: boolean }>>;
  /** Components drawn in gold, on top. Defaults to the majors of `expected`. */
  majors?: readonly string[];
  size?: number;
  title?: string;
  /** Full component names (as in the Centrale tool) or short ones for small cards. */
  labels?: "full" | "short";
  activeSkill?: string;
  onSelect?: (skill: string) => void;
  preview?: { skill: string; level: ExpectedLevel };
};

export const RED = "#C8102E";
export const GOLD = "#F0C300";
const DISK = "#E8E8E8";
const INK = "#1c1c20";
const DOTS = "2 2";
const CENTER_PART = 0.09;

export function Rosace({
  declared,
  observed = {},
  observedLevels,
  expected = {},
  majors,
  size = 420,
  title,
  labels = size >= 360 ? "full" : "short",
  activeSkill,
  onSelect,
  preview,
}: RosaceProps) {
  const font = Math.max(12, Math.round(size / (labels === "full" ? 40 : 18)));
  const margin = Math.round(font * (labels === "full" ? 9 : 6.5));
  const center = size / 2;
  const radius = round(center - font * (labels === "full" ? 4.2 : 3.6));
  const hub = round(radius * CENTER_PART);
  const at = (level: number) => round(hub + (level / 3) * (radius - hub));
  const thickness = round(Math.max(radius * 0.045, 3));
  const golden = new Set(
    majors ??
      Object.entries(expected)
        .filter(([, want]) => want?.major)
        .map(([code]) => code),
  );
  const showTalent = declared !== undefined || observedLevels !== undefined;

  const bars = (onlyMajors: boolean) =>
    COMPONENTS.map((component, index) => {
      const major = golden.has(component.code);
      if (major !== onlyMajors) return null;
      const level =
        observedLevels !== undefined
          ? observedLevels[component.code]
          : showTalent
            ? declared?.[component.code]
            : expected[component.code]?.level;
      if (typeof level !== "number") return null;
      const angle = angleOf(index);
      const color = major ? GOLD : RED;
      if (level === 0) {
        const dot = point(center, hub + thickness, angle);
        return (
          <circle
            key={component.code}
            cx={dot.x}
            cy={dot.y}
            r={thickness / 2}
            fill={color}
          />
        );
      }
      const start = point(center, hub, angle);
      const end = point(center, at(level), angle);
      const dotted =
        showTalent && observedLevels === undefined && !observed[component.code];
      return (
        <line
          key={component.code}
          className="rosace-branch"
          data-skill={component.code}
          data-level={level}
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap={dotted ? "butt" : "round"}
          strokeDasharray={
            dotted
              ? `${round(thickness * 1.1)} ${round(thickness * 0.7)}`
              : undefined
          }
        />
      );
    });

  return (
    <figure className="rosace-figure flex w-full flex-col items-center">
      {title ? (
        <figcaption
          className="mb-1 text-center font-bold leading-tight"
          style={{ color: RED, fontSize: Math.max(15, Math.round(size / 24)) }}
        >
          {title}
        </figcaption>
      ) : null}
      <svg
        viewBox={`${-margin} 0 ${size + 2 * margin} ${size}`}
        width={size + 2 * margin}
        height={size}
        className="h-auto max-w-full"
        role={onSelect ? "group" : "img"}
        aria-label={title ? `Rosace: ${title}` : "Rosace"}
      >
        {activeSkill &&
          COMPONENTS.map((c, i) =>
            c.code === activeSkill ? (
              <line
                key={c.code}
                x1={center}
                y1={center}
                x2={point(center, radius, angleOf(i)).x}
                y2={point(center, radius, angleOf(i)).y}
                stroke="#d5b35d"
                strokeOpacity={0.15}
                strokeWidth={30}
                strokeLinecap="round"
              />
            ) : null,
          )}
        <circle cx={center} cy={center} r={at(1)} fill={DISK} />
        {COMPONENTS.map((component, index) => {
          const angle = angleOf(index);
          const from = point(center, at(1), angle);
          const to = point(center, radius, angle);
          return (
            <line
              key={component.code}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={RED}
              strokeWidth={1}
              strokeDasharray={DOTS}
            />
          );
        })}
        <circle
          cx={center}
          cy={center}
          r={at(2)}
          fill="none"
          stroke={RED}
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeDasharray={DOTS}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={RED}
          strokeWidth={1}
          strokeDasharray={DOTS}
        />
        {bars(false)}
        {bars(true)}
        {preview &&
          (() => {
            const index = COMPONENTS.findIndex((c) => c.code === preview.skill);
            if (index < 0) return null;
            const start = point(center, hub, angleOf(index));
            const end = point(center, at(preview.level), angleOf(index));
            return (
              <line
                className="rosace-preview"
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="currentColor"
                strokeWidth={thickness}
                strokeOpacity={0.5}
                strokeLinecap="round"
              >
                <title>
                  Level preview — choose Major or Minor to include it
                </title>
              </line>
            );
          })()}
        {showTalent
          ? COMPONENTS.map((component, index) => {
              const want = expected[component.code];
              if (!want) return null;
              return (
                <ExpectedTick
                  key={component.code}
                  center={center}
                  angle={angleOf(index)}
                  distance={at(want.level)}
                  half={thickness * 1.1}
                  major={want.major}
                />
              );
            })
          : null}
        <circle cx={center} cy={center} r={hub} fill="#ffffff" stroke={DISK} />
        <LogoMark cx={center} cy={center} r={hub * 0.82} />
        {COMPONENTS.map((component, index) => (
          <Label
            key={component.code}
            text={labels === "full" ? component.name : component.short}
            index={index}
            center={center}
            radius={radius}
            font={font}
            strong={golden.has(component.code)}
          />
        ))}
        {onSelect &&
          COMPONENTS.map((component, index) => {
            const start = point(center, at(1) - 8, angleOf(index)),
              end = point(center, radius + font, angleOf(index));
            const want = expected[component.code],
              level =
                observedLevels?.[component.code] ??
                declared?.[component.code] ??
                want?.level;
            return (
              <g
                key={component.code}
                className="rosace-control"
                role="button"
                tabIndex={0}
                aria-label={`Explore ${component.name}`}
                aria-pressed={activeSkill === component.code}
                onClick={() => onSelect(component.code)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(component.code);
                  }
                  const direction =
                    event.key === "ArrowRight" || event.key === "ArrowDown"
                      ? 1
                      : event.key === "ArrowLeft" || event.key === "ArrowUp"
                        ? -1
                        : 0;
                  if (direction) {
                    event.preventDefault();
                    const controls =
                      event.currentTarget.ownerSVGElement?.querySelectorAll<SVGGElement>(
                        ".rosace-control",
                      );
                    controls?.[
                      (index + direction + COMPONENTS.length) %
                        COMPONENTS.length
                    ]?.focus();
                  }
                }}
              >
                <title>{`${component.name}: ${typeof level === "number" ? `level ${level}` : "not filled in"}${want?.major ? ", major" : ""}`}</title>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="transparent"
                  strokeWidth={28}
                />
                <circle
                  cx={end.x}
                  cy={end.y}
                  r={5}
                  className="rosace-focus-dot"
                />
              </g>
            );
          })}
      </svg>
    </figure>
  );
}

function ExpectedTick({
  center,
  angle,
  distance,
  half,
  major,
}: {
  center: number;
  angle: number;
  distance: number;
  half: number;
  major: boolean;
}) {
  const mid = point(center, distance, angle);
  const dx = -Math.sin(angle) * half;
  const dy = Math.cos(angle) * half;
  return (
    <line
      className="expected-tick"
      x1={round(mid.x - dx)}
      y1={round(mid.y - dy)}
      x2={round(mid.x + dx)}
      y2={round(mid.y + dy)}
      stroke={INK}
      strokeWidth={major ? 3 : 2}
      strokeLinecap="round"
    />
  );
}

function Label({
  text,
  index,
  center,
  radius,
  font,
  strong,
}: {
  text: string;
  index: number;
  center: number;
  radius: number;
  font: number;
  strong: boolean;
}) {
  const half = COMPONENTS.length / 2;
  const anchor =
    index === 0 || index === half ? "middle" : index < half ? "start" : "end";
  const lines = splitLabel(text);
  const lineHeight = font * 1.2;
  const angle = angleOf(index);
  const spot = point(center, radius + font * 1.2, angle);
  const block = ((lines.length - 1) * lineHeight) / 2;
  let y = spot.y;
  if (index === 0) y -= block + lineHeight / 2;
  if (index === half) y += block + lineHeight / 2;
  return (
    <text
      x={spot.x}
      y={round(y)}
      textAnchor={anchor}
      dominantBaseline="middle"
      fontSize={font}
      fill={INK}
      fontWeight={strong ? 700 : 400}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={spot.x} dy={i === 0 ? -block : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

/** Same rule as the Centrale tool: short labels stay on one line, longer ones split into two balanced lines. */
function splitLabel(text: string): string[] {
  if (text.length <= 14) return [text];
  const words = text.split(" ");
  let best = 1;
  let gap = Number.POSITIVE_INFINITY;
  for (let cut = 1; cut < words.length; cut++) {
    const difference = Math.abs(
      words.slice(0, cut).join(" ").length - words.slice(cut).join(" ").length,
    );
    if (difference < gap) {
      gap = difference;
      best = cut;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

function angleOf(index: number): number {
  return -Math.PI / 2 + (index * 2 * Math.PI) / COMPONENTS.length;
}

function point(center: number, distance: number, angle: number) {
  return {
    x: round(center + distance * Math.cos(angle)),
    y: round(center + distance * Math.sin(angle)),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
