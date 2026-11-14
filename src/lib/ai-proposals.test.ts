import { expect, it, vi } from "vitest";
import {
  validateRequirements,
  validateExercise,
  cleanExercise,
} from "./ai-proposals";
import { proposeExercise } from "./server/ai-proposals";
const passages = [
  {
    id: "job:1",
    sourceId: "job",
    title: "Fictional role",
    text: "Test sensor firmware in a hardware lab.",
  },
];
const requirements = ["C5.1", "C4.1", "C2.2"].map((skill) => ({
  skill,
  expected: 2,
  major: true,
  reason: "Test the fictional sensor",
  sourceIds: ["job:1"],
}));
it("accepts only closed-list requirements and cited, valid need rules", () => {
  expect(
    validateRequirements({ requirements }, passages).requirements,
  ).toHaveLength(3);
  expect(() =>
    validateRequirements({ requirements: requirements.slice(1) }, passages),
  ).toThrow();
  expect(() =>
    validateRequirements(
      {
        requirements: [
          { ...requirements[0], skill: "invented" },
          ...requirements.slice(1),
        ],
      },
      passages,
    ),
  ).toThrow();
  expect(() =>
    validateRequirements(
      {
        requirements: requirements.map((r) => ({
          ...r,
          sourceIds: ["invented"],
        })),
      },
      passages,
    ),
  ).toThrow("source");
});
it("locks exercise level and duration, strips automatic grades, and checks snapshots", () => {
  const e = validateExercise(
    {
      prompt: "Inspect this fictional sensor function.",
      checks: ["Boundary", "Failure", "Explanation"],
      sourceIds: ["job:1"],
      grade: "A",
      level: 3,
      minutes: 90,
    },
    "C5.1",
    1,
    passages,
  );
  expect(e).toMatchObject({ level: 1, minutes: 6 });
  expect(e).not.toHaveProperty("grade");
  expect(cleanExercise(e, "C5.1", 1).prompt).toBe(e.prompt);
  expect(() => cleanExercise({ ...e, level: 3 }, "C5.1", 1)).toThrow();
});
it("rejects unsupported exercise requests before any paid call", async () => {
  const f = vi.fn();
  await expect(proposeExercise("C4.3", 1, "Demo", [], f)).rejects.toThrow();
  expect(f).not.toHaveBeenCalled();
});

it("uses reviewed source passages for an exercise and rejects invented references", async () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-only");
  vi.stubEnv("ANTHROPIC_MODEL", "claude-test-model");
  try {
    const f = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            stop_reason: "end_turn",
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  prompt:
                    "Inspect a fictional sensor reset using its power log.",
                  checks: ["Facts", "Questions", "Check"],
                  sourceIds: ["job:1"],
                }),
              },
            ],
          }),
        ),
      );
    const result = await proposeExercise(
      "C5.1",
      1,
      "Sensor testing",
      [
        {
          id: "job",
          title: "Reviewed job",
          text: "Investigate sensor restarts in the lab.",
        },
      ],
      f,
    );
    expect(result.sourceIds).toEqual(["job:1"]);
    const payload = JSON.parse(f.mock.calls[0][1].body);
    expect(JSON.parse(payload.messages[0].content).passages[0].text).toContain(
      "sensor restarts",
    );
    expect(payload.system).toContain("untrusted data");
    expect(() =>
      validateExercise(
        { prompt: "A task", checks: ["A", "B", "C"], sourceIds: ["invented"] },
        "C5.1",
        1,
        passages,
      ),
    ).toThrow("source");
  } finally {
    vi.unstubAllEnvs();
  }
});
