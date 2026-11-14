import { isComponent, SKILL_CODES } from "./framework";
import { MAJOR_COUNT, MAX_JOB_SKILLS, type Requirement } from "./scoring";

export type SelectionRole = "none" | "major" | "minor" | "job";

/** Changing priority preserves the expected level and never duplicates a skill. */
export function changeSelection(
  current: Requirement[],
  skill: string,
  role: SelectionRole,
): Requirement[] {
  if (!SKILL_CODES.has(skill)) return current;
  if (
    (role === "job" && isComponent(skill)) ||
    ((role === "major" || role === "minor") && !isComponent(skill))
  )
    return current;
  const previous = current.find((r) => r.skill === skill);
  const next = current.filter((r) => r.skill !== skill);
  if (role === "none") return next;
  if (role === "major" && next.filter((r) => r.major).length >= MAJOR_COUNT)
    return current;
  if (
    role === "job" &&
    next.filter((r) => !isComponent(r.skill)).length >= MAX_JOB_SKILLS
  )
    return current;
  return [
    ...next,
    { skill, major: role === "major", expected: previous?.expected ?? 1 },
  ];
}
