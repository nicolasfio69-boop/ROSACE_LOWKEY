import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { aiStatus, generateJSON } from "./ai";
import { generateExamples } from "./ai-examples";
import { generateFeedback } from "./exercise-feedback";
beforeEach(() => {
  vi.stubEnv("AI_PROVIDER", "featherless");
  vi.stubEnv("FEATHERLESS_API_KEY", "test-secret");
  vi.stubEnv("FEATHERLESS_MODEL", "organisation/instruction-model");
});
afterEach(() => vi.unstubAllEnvs());
const reply = (value: unknown, finish_reason = "stop") =>
  new Response(
    JSON.stringify({
      choices: [{ finish_reason, message: { content: JSON.stringify(value) } }],
    }),
  );
it("uses Featherless chat completions with a server-only key and bounded output", async () => {
  const f = vi.fn().mockResolvedValue(reply({ ok: true }));
  expect(
    await generateJSON("JSON only", { task: "fictional" }, f),
  ).toMatchObject({ value: { ok: true }, provider: "Featherless" });
  expect(f.mock.calls[0][0]).toBe(
    "https://api.featherless.ai/v1/chat/completions",
  );
  const options = f.mock.calls[0][1];
  expect(options.headers.Authorization).toBe("Bearer test-secret");
  expect(JSON.parse(options.body)).toMatchObject({
    model: "organisation/instruction-model",
    max_tokens: 1800,
    stream: false,
    messages: [
      { role: "system", content: "JSON only" },
      { role: "user", content: '{"task":"fictional"}' },
    ],
  });
  expect(aiStatus()).toEqual({ provider: "Featherless", configured: true });
});
it("does not silently fall back to Gemini when Featherless is unconfigured", async () => {
  vi.stubEnv("FEATHERLESS_API_KEY", "");
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
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              choices: [
                { finish_reason: "stop", message: { content: "not JSON" } },
              ],
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
it("validates Featherless source citations through the same human-review pipeline", async () => {
  const f = vi
    .fn()
    .mockResolvedValue(
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
  expect(result.provider).toBe("Featherless");
  expect(result.passages).toHaveLength(1);
  const bad = vi
    .fn()
    .mockResolvedValue(
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
  const f = vi
    .fn()
    .mockResolvedValue(
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
