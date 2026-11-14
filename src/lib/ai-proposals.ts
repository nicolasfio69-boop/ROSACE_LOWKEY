import { SKILL_CODES, type ExpectedLevel } from "./framework";
import { checkNeed, type Requirement } from "./scoring";
import { checkExercise, type CheckExercise } from "./verification";
import type { Passage } from "./context";
export type RequirementProposal = {
  requirements: (Requirement & { reason: string; sourceIds: string[] })[];
  passages: Passage[];
};
export type ExerciseProposal = CheckExercise & {
  sourceIds: string[];
  passages: Passage[];
};
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid proposal.");
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new Error("Invalid proposal text.");
  return value.trim();
}
function citations(value: unknown, passages: Passage[]): string[] {
  if (
    !Array.isArray(value) ||
    !value.length ||
    value.length > 6 ||
    value.some(
      (id) => typeof id !== "string" || !passages.some((p) => p.id === id),
    )
  )
    throw new Error("Unrecognised or missing source reference.");
  return [...new Set(value)] as string[];
}
export function validateRequirements(
  value: unknown,
  passages: Passage[],
): RequirementProposal {
  const data = object(value);
  if (!Array.isArray(data.requirements) || data.requirements.length > 15)
    throw new Error("Invalid requirements.");
  const requirements = data.requirements.map((raw) => {
    const r = object(raw);
    if (
      typeof r.skill !== "string" ||
      !SKILL_CODES.has(r.skill) ||
      ![1, 2, 3].includes(r.expected as number) ||
      typeof r.major !== "boolean"
    )
      throw new Error("Unknown skill or invalid level.");
    return {
      skill: r.skill,
      expected: r.expected as ExpectedLevel,
      major: r.major,
      reason: text(r.reason, 600),
      sourceIds: citations(r.sourceIds, passages),
    };
  });
  if (
    checkNeed({
      id: "proposal",
      company: "Fictional",
      title: "Reviewed role",
      capacity: 3,
      requirements,
    }).length
  )
    throw new Error("The proposal does not follow the need rules.");
  return {
    requirements,
    passages: passages.filter((p) =>
      requirements.some((r) => r.sourceIds.includes(p.id)),
    ),
  };
}
export function validateExercise(
  value: unknown,
  skill: string,
  level: ExpectedLevel,
  passages: Passage[],
): ExerciseProposal {
  const data = object(value),
    base = checkExercise(skill, level);
  if (!Array.isArray(data.checks) || data.checks.length !== 3)
    throw new Error("An exercise needs three human review criteria.");
  const sourceIds = citations(data.sourceIds, passages);
  return {
    ...base,
    prompt: text(data.prompt, 2500),
    checks: data.checks.map((c) => text(c, 500)),
    sourceIds,
    passages: passages.filter((p) => sourceIds.includes(p.id)),
  };
}
/** Revalidate stored or client-supplied exercise snapshots; never trust extra scoring fields. */
export function cleanExercise(
  value: unknown,
  skill: string,
  level: ExpectedLevel,
): CheckExercise {
  const data = object(value),
    base = checkExercise(skill, level);
  if (
    data.skill !== skill ||
    data.level !== level ||
    data.minutes !== base.minutes ||
    !Array.isArray(data.checks) ||
    data.checks.length !== 3
  )
    throw new Error("Invalid exercise snapshot.");
  return {
    ...base,
    prompt: text(data.prompt, 2500),
    checks: data.checks.map((c) => text(c, 500)),
  };
}
