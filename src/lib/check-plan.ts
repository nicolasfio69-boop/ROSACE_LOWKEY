import type { Need } from "./scoring";
import { CHECK_SKILLS, checkExercise } from "./verification";
export const ONLINE_BUDGET_MINUTES = 20;
export function onlineSkillsFor(need: Need): string[] {
  return need.requirements
    .filter((r) => CHECK_SKILLS.includes(r.skill))
    .map((r) => r.skill);
}
export function planMinutes(skills: readonly string[]): number {
  return skills.reduce(
    (total, skill) => total + checkExercise(skill, 1).minutes,
    0,
  );
}
export function defaultCheckPlan(need: Need): string[] {
  const skills: string[] = [];
  const requirements = [...need.requirements].sort(
    (a, b) => Number(b.major) - Number(a.major),
  );
  for (const { skill } of requirements) {
    if (
      CHECK_SKILLS.includes(skill) &&
      planMinutes([...skills, skill]) <= ONLINE_BUDGET_MINUTES
    )
      skills.push(skill);
  }
  return skills;
}
export function validateCheckPlan(
  need: Need,
  skills: readonly string[],
): string[] {
  const allowed = onlineSkillsFor(need);
  if (
    new Set(skills).size !== skills.length ||
    skills.some((s) => !allowed.includes(s))
  )
    throw new Error("Choose each online requirement at most once.");
  if (planMinutes(skills) > ONLINE_BUDGET_MINUTES)
    throw new Error(
      "Keep the online plan within 20 minutes. Remove an exercise before adding another.",
    );
  return [...skills];
}
