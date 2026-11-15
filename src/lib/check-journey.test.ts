import { expect, it } from "vitest";
import { NEEDS } from "@/data/demo";
import { SKILL_CODES } from "./framework";
import {
  CHECK_SKILLS,
  DEMO_CHECK_SKILLS,
  checkExercise,
  verificationFor,
} from "./verification";
import { defaultCheckPlan, planMinutes, validateCheckPlan } from "./check-plan";
import {
  cleanCheckTiming,
  formatSeconds,
  secondsRemaining,
  startCheckAttempt,
} from "./check-timing";
import { demoPosition, demoTime } from "./demo-playback";
import { validateFeedback } from "./exercises";

it("covers every online skill and no on-site-only skill at all three task levels", () => {
  expect(new Set(CHECK_SKILLS)).toEqual(
    new Set(
      [...SKILL_CODES].filter((s) =>
        verificationFor(s).modes.includes("online"),
      ),
    ),
  );
  expect(CHECK_SKILLS).toHaveLength(26);
  for (const skill of CHECK_SKILLS) {
    const tasks = ([1, 2, 3] as const).map((level) =>
      checkExercise(skill, level),
    );
    expect(new Set(tasks.map((t) => t.prompt)).size).toBe(3);
    for (const task of tasks) {
      expect(task.prompt.length).toBeLessThanOrEqual(2500);
      expect(task.checks).toHaveLength(3);
      expect(task.minutes).toBeGreaterThan(0);
      expect(task.minutes).toBeLessThanOrEqual(20);
    }
  }
  expect(
    DEMO_CHECK_SKILLS.reduce((sum, s) => sum + checkExercise(s, 1).minutes, 0),
  ).toBe(20);
  expect(() => checkExercise("C4.3", 1)).toThrow();
});
it("selects relevant defaults within the event budget and rejects unrelated or excessive plans", () => {
  expect(defaultCheckPlan(NEEDS[0])).toEqual(["C5.1", "C2.2", "J.EMBEDDED_C"]);
  expect(planMinutes(defaultCheckPlan(NEEDS[0]))).toBe(20);
  expect(defaultCheckPlan(NEEDS[1])).toEqual(["C2.2", "J.TROUBLESHOOT"]);
  expect(validateCheckPlan(NEEDS[0], ["C5.2"])).toEqual(["C5.2"]);
  expect(() => validateCheckPlan(NEEDS[0], ["C5.2", "C5.1"])).toThrow(
    "20 minutes",
  );
  expect(() => validateCheckPlan(NEEDS[0], ["J.SQL"])).toThrow();
  expect(() => validateCheckPlan(NEEDS[0], ["C4.1"])).toThrow();
  expect(() => validateCheckPlan(NEEDS[0], ["C5.1", "C5.1"])).toThrow();
});
it("uses elapsed wall time, including inactive time, and snapshots the task when starting", () => {
  const task = checkExercise("C5.1", 1);
  const attempt = startCheckAttempt(task, 1000);
  task.prompt = "Later edit";
  task.checks[0] = "Changed criterion";
  expect(attempt.exercise.prompt).not.toBe(task.prompt);
  expect(attempt.exercise.checks[0]).not.toBe(task.checks[0]);
  expect(secondsRemaining(attempt, 1000)).toBe(360);
  expect(secondsRemaining(attempt, 360001)).toBe(1);
  expect(secondsRemaining(attempt, 361000)).toBe(0);
  expect(secondsRemaining(attempt, 500000)).toBe(0);
  expect(formatSeconds(360)).toBe("6:00");
  expect(
    cleanCheckTiming(
      { startedAt: 1000, submittedAt: 400000, allowedSeconds: 360 },
      6,
    ),
  ).toEqual({ startedAt: 1000, submittedAt: 400000, allowedSeconds: 360 });
  expect(cleanCheckTiming(undefined, 6)).toBeUndefined();
  expect(() =>
    cleanCheckTiming({ startedAt: 5, submittedAt: 2, allowedSeconds: 360 }, 6),
  ).toThrow();
  expect(() =>
    cleanCheckTiming({ startedAt: 0, submittedAt: 2, allowedSeconds: 720 }, 6),
  ).toThrow();
});
it("keeps the 3-minute recording inside four chapters and reaches a stable end", () => {
  expect(demoPosition(0)).toMatchObject({
    chapter: 0,
    beat: 0,
    complete: false,
  });
  expect(demoPosition(11250)).toMatchObject({ chapter: 0, beat: 1 });
  expect(demoPosition(45000)).toMatchObject({ chapter: 1, beat: 0 });
  expect(demoPosition(180000)).toMatchObject({
    chapter: 3,
    beat: 3,
    complete: true,
  });
  expect(demoPosition(999999).elapsed).toBe(180000);
  expect(demoTime(180000)).toBe("3:00");
  expect(demoPosition(NaN).elapsed).toBe(0);
});
it("validates an advisory grade against quoted criteria without accepting numeric scores", () => {
  const answer = "Ask about power. Separate facts. Test the connection.";
  const task = checkExercise("C5.1", 1);
  const feedback = {
    strengths: [],
    questions: ["What if power is stable?"],
    limitations: "A human must validate this written exercise.",
    recommendation: {
      grade: "A",
      reason: "All criteria are shown in this fictional answer.",
      criteria: [
        "Ask about power",
        "Separate facts",
        "Test the connection",
      ].map((quote, index) => ({
        index,
        verdict: "met",
        quote,
        reason: "Evidence is present.",
      })),
    },
    score: 100,
  };
  const validated = validateFeedback(feedback, answer, task.checks);
  expect(validated.recommendation?.grade).toBe("A");
  expect(validated).not.toHaveProperty("score");
  expect(() =>
    validateFeedback(
      { ...feedback, recommendation: undefined },
      answer,
      task.checks,
    ),
  ).toThrow();
  expect(() =>
    validateFeedback(
      {
        ...feedback,
        recommendation: { ...feedback.recommendation, grade: 10 },
      },
      answer,
      task.checks,
    ),
  ).toThrow();
  expect(() =>
    validateFeedback(
      {
        ...feedback,
        recommendation: {
          ...feedback.recommendation,
          criteria: feedback.recommendation.criteria.map((c) => ({
            ...c,
            quote: "Invented evidence",
          })),
        },
      },
      answer,
      task.checks,
    ),
  ).toThrow();
  expect(() =>
    validateFeedback(
      {
        ...feedback,
        recommendation: {
          ...feedback.recommendation,
          criteria: feedback.recommendation.criteria.map((c) => ({
            ...c,
            verdict: "not_covered",
            quote: null,
          })),
        },
      },
      answer,
      task.checks,
    ),
  ).toThrow();
  expect(() =>
    validateFeedback(
      {
        ...feedback,
        recommendation: {
          ...feedback.recommendation,
          criteria: feedback.recommendation.criteria.map((c) => ({
            ...c,
            index: 0,
          })),
        },
      },
      answer,
      task.checks,
    ),
  ).toThrow();
});
