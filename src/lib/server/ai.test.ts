import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { aiStatus, generateJSON } from "./ai";
import { generateExamples } from "./ai-examples";
import { generateFeedback } from "./exercise-feedback";
beforeEach(() => {
  vi.stubEnv("AI_PROVIDER", "anthropic");
  vi.stubEnv("ANTHROPIC_API_KEY", "test-secret");
  vi.stubEnv("ANTHROPIC_MODEL", "claude-test-model");
});
afterEach(() => vi.unstubAllEnvs());
const reply = (value: unknown, finish_reason = "end_turn") =>
  new Response(
    JSON.stringify({
      stop_reason: finish_reason,
      content: [{ type: "text", text: JSON.stringify(value) }],
    }),
  );
it("uses Claude chat completions with a server-only key and bounded output", async () => {
  const f = vi.fn().mockResolvedValue(reply({ ok: true }));
  expect(
    await generateJSON("JSON only", { task: "fictional" }, f),
  ).toMatchObject({ value: { ok: true }, provider: "Claude" });
  expect(f.mock.calls[0][0]).toBe("https://api.anthropic.com/v1/messages");
  const options = f.mock.calls[0][1];
  expect(options.headers["x-api-key"]).toBe("test-secret");
  expect(JSON.parse(options.body)).toMatchObject({
    model: "claude-test-model",
    max_tokens: 4096,
    messages: [{ role: "user", content: '{"task":"fictional"}' }],
  });
  expect(aiStatus()).toEqual({ provider: "Claude", configured: true });
});
it("does not silently fall back to Gemini when Claude is unconfigured", async () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  vi.stubEnv("GEMINI_API_KEY", "other-key");
  const f = vi.fn();
  await expect(generateJSON("", {}, f)).rejects.toThrow("not configured");
  expect(f).not.toHaveBeenCalled();
});
it("rejects truncation, invalid JSON and upstream errors without exposing their body", async () => {
  await expect(
    generateJSON("", {}, vi.fn().mockResolvedValue(reply({}, "length"))),
  ).rejects.toThrow("incomplete");
  await expect(
    generateJSON(
      "",
      {},
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            stop_reason: "end_turn",
            content: [{ type: "text", text: "not JSON" }],
          }),
        ),
      ),
    ),
  ).rejects.toThrow("valid JSON");
  await expect(
    generateJSON(
      "",
      {},
      vi
        .fn()
        .mockResolvedValue(
          new Response("SECRET_PROVIDER_DETAIL", { status: 401 }),
        ),
    ),
  ).rejects.toThrow("Check its key");
});
it("validates Claude source citations through the same human-review pipeline", async () => {
  const f = vi.fn().mockResolvedValue(
    reply({
      examples: {
        1: "With help",
        2: "Independently",
        3: "In a new situation",
      },
      sourceIds: ["job:1"],
    }),
  );
  const result = await generateExamples(
    "C2.2",
    "Demo",
    "test",
    [{ id: "job", title: "Job", text: "Test a fictional sensor" }],
    f,
  );
  expect(result.provider).toBe("Claude");
  expect(result.passages).toHaveLength(1);
  const bad = vi.fn().mockResolvedValue(
    reply({
      examples: { 1: "A", 2: "B", 3: "C" },
      sourceIds: ["invented:1"],
    }),
  );
  await expect(
    generateExamples(
      "C2.2",
      "Demo",
      "test",
      [{ id: "job", title: "Job", text: "Test sensors" }],
      bad,
    ),
  ).rejects.toThrow("source");
});
it("validates quoted exercise feedback without assigning a level", async () => {
  const f = vi.fn().mockResolvedValue(
    reply({
      strengths: [
        { quote: "ask about the task", comment: "Clarifies context" },
      ],
      questions: ["How would you confirm it?"],
      limitations: "A written answer is not verified ability.",
      level: 3,
    }),
  );
  expect(
    await generateFeedback("C1.1", "I would ask about the task.", f),
  ).not.toHaveProperty("level");
});
it("only needs the API key: the model falls back to the default", () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  vi.stubEnv("ANTHROPIC_MODEL", "");
  expect(aiStatus()).toEqual({ provider: "Claude", configured: true });
});
