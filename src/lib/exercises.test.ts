import { beforeEach } from "vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { COMPONENTS } from "./framework";
import { exerciseFor, validateFeedback } from "./exercises";
import { generateFeedback } from "./server/exercise-feedback";
beforeEach(() => vi.stubEnv("AI_PROVIDER", "anthropic"));
afterEach(() => vi.unstubAllEnvs());
describe("practice without automatic assessment", () => {
  it("covers exactly the twelve components with concrete review criteria", () => {
    for (const c of COMPONENTS) {
      expect(exerciseFor(c.code).checks).toHaveLength(3);
      expect(exerciseFor(c.code).scenario).toContain("fictional");
    }
    expect(() => exerciseFor("invented")).toThrow();
  });
  it("rejects invented quotes and strips extra scores from feedback", () => {
    const answer = "I would ask which action is slow.";
    const value = {
      strengths: [
        { quote: "which action is slow", comment: "Clarifies the task" },
      ],
      questions: ["How would you confirm the answer?"],
      limitations: "A written answer is not verified ability.",
      score: 99,
    };
    expect(validateFeedback(value, answer)).not.toHaveProperty("score");
    expect(() =>
      validateFeedback(
        {
          ...value,
          strengths: [{ quote: "I led the project", comment: "Leadership" }],
        },
        answer,
      ),
    ).toThrow();
  });
  it("never calls a provider without a key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const f = vi.fn();
    await expect(
      generateFeedback("C1.1", "A synthetic answer", f),
    ).rejects.toThrow("not configured");
    expect(f).not.toHaveBeenCalled();
  });
  it("checks the model response and cites only the practice answer", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubEnv("ANTHROPIC_MODEL", "claude-test-model");
    const feedback = {
      strengths: [],
      questions: ["What would you clarify?"],
      limitations: "Not enough evidence to verify a skill.",
    };
    const f = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          stop_reason: "end_turn",
          content: [
            {
              type: "text",
              text: JSON.stringify(feedback),
            },
          ],
        }),
      ),
    );
    expect(
      await generateFeedback("C1.1", "I would ask about the task.", f),
    ).toEqual(feedback);
    expect(JSON.parse(f.mock.calls[0][1].body).system).toContain("No scores");
  });
});
