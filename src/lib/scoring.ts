/**
 * Declared alignment between a talent card and a company need.
 *
 * Pure functions, no AI. The same logic as the Centrale Lyon Conseil tool:
 * points = requirement weight × level, coverage threshold 70 %. The level is
 * capped at the level the company expects, so overqualification earns nothing.
 * Where a statement comes from (CV mention, declared, supported) is displayed
 * but never changes the numbers.
 */
import type { ExpectedLevel, LevelValue } from "./framework";

export const MAJOR_WEIGHT = 2;
export const MINOR_WEIGHT = 1;
export const COVERAGE_THRESHOLD = 0.7;

export type Requirement = {
  skill: string;
  major: boolean;
  expected: ExpectedLevel;
  /** The recruiter's own sentence that justifies the requirement. */
  reason?: string;
  /** Example of the expected level in the context of this job, validated by the recruiter. */
  example?: string;
};

export type Need = {
  id: string;
  company: string;
  title: string;
  /** How many people the recruiter wants to meet. */
  capacity: number;
  requirements: Requirement[];
};

export type Evidence = "declared" | "situation" | "supported";

export type Statement = {
  /** null = mentioned in the CV but not detailed by the talent. */
  level: LevelValue | null;
  evidence?: Evidence;
  /** Sentence of the CV where the skill was spotted, validated by the talent. */
  cvQuote?: string;
  /** Link to something the reader can consult (repository, portfolio). */
  link?: string;
};

export type Talent = {
  id: string;
  pseudonym: string;
  cv: string;
  statements: Record<string, Statement>;
};

export type RowStatus = "met" | "below" | "unknown" | "mentioned";

export type AlignmentRow = {
  requirement: Requirement;
  weight: number;
  level: LevelValue | null;
  counted: number;
  points: number;
  max: number;
  status: RowStatus;
  aboveExpected: boolean;
};

export type Alignment = {
  needId: string;
  talentId: string;
  points: number;
  max: number;
  coveredWeight: number;
  totalWeight: number;
  complete: boolean;
  missingMajors: string[];
  aboveExpected: string[];
  rows: AlignmentRow[];
};

export function weightOf(requirement: Requirement): number {
  return requirement.major ? MAJOR_WEIGHT : MINOR_WEIGHT;
}

export function align(need: Need, talent: Talent): Alignment {
  const rows = need.requirements.map((requirement): AlignmentRow => {
    const weight = weightOf(requirement);
    const statement = talent.statements[requirement.skill];
    const level = statement?.level ?? null;
    const counted = level === null ? 0 : Math.min(level, requirement.expected);
    let status: RowStatus;
    if (level === null) status = statement?.cvQuote ? "mentioned" : "unknown";
    else status = level >= requirement.expected ? "met" : "below";
    return {
      requirement,
      weight,
      level,
      counted,
      points: weight * counted,
      max: weight * requirement.expected,
      status,
      aboveExpected: level !== null && level > requirement.expected,
    };
  });

  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  const coveredWeight = rows.reduce((sum, row) => sum + (row.level === null ? 0 : row.weight), 0);

  return {
    needId: need.id,
    talentId: talent.id,
    points: rows.reduce((sum, row) => sum + row.points, 0),
    max: rows.reduce((sum, row) => sum + row.max, 0),
    coveredWeight,
    totalWeight,
    complete: totalWeight > 0 && coveredWeight / totalWeight >= COVERAGE_THRESHOLD,
    missingMajors: rows.filter((row) => row.requirement.major && row.status !== "met").map((row) => row.requirement.skill),
    aboveExpected: rows.filter((row) => row.aboveExpected).map((row) => row.requirement.skill),
    rows,
  };
}

/** Centrale observation grid, used by the recruiter after the conversation. */
export type Observation = "A" | "C" | "F" | "NE";

export const OBSERVATION_LABELS: Record<Observation, string> = {
  A: "Seen clearly",
  C: "Seen in part",
  F: "Not seen",
  NE: "Not covered",
};

const PERFORMANCE: Record<Exclude<Observation, "NE">, number> = { A: 1, C: 0.6, F: 0 };

/** Observed value = level points × performance. "Not covered" yields nothing. Never added to the declared value. */
export function observedValue(level: LevelValue, observation: Observation): number | null {
  if (observation === "NE") return null;
  return level * PERFORMANCE[observation];
}
