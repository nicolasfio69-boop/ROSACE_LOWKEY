import { expect, it } from "vitest";
import { SKILL_CODES } from "./framework";
import {
  CHECK_SKILLS,
  DEMO_CHECK_SKILLS,
  checkExercise,
  checkStatus,
  verificationFor,
} from "./verification";
it("provides a concrete verification situation for every approved skill", () => {
  for (const code of SKILL_CODES) {
    const rule = verificationFor(code);
    expect(rule.modes.length).toBeGreaterThan(0);
    expect(rule.situation.length).toBeGreaterThan(25);
  }
  expect(verificationFor("C4.3").modes).toEqual(["interview"]);
  expect(verificationFor("C4.3").situation).toContain(
    "Discussed, not observed",
  );
  expect(() => verificationFor("invented")).toThrow();
});
it("has three distinct versions per demo exercise and fits the 20-minute total", () => {
  for (const skill of CHECK_SKILLS)
    expect(
      new Set(([1, 2, 3] as const).map((l) => checkExercise(skill, l).prompt))
        .size,
    ).toBe(3);
  expect(
    DEMO_CHECK_SKILLS.reduce((sum, s) => sum + checkExercise(s, 3).minutes, 0),
  ).toBe(20);
  expect(() => checkExercise("C1.1", 1)).toThrow();
});
it("distinguishes submission from a human grade", () => {
  expect(checkStatus(false, false)).toBe("To check");
  expect(checkStatus(true, false)).toBe("Done");
  expect(checkStatus(true, true)).toBe("Graded");
});
