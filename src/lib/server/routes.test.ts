import { afterEach, describe, it, expect, vi } from "vitest";
import { POST as company } from "@/app/api/company-context/route";
import { POST as examples } from "@/app/api/level-examples/route";
import { POST as exercise } from "@/app/api/exercise-feedback/route";
afterEach(() => vi.unstubAllEnvs());
const request = (data: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
describe("local API fallback and review gates", () => {
  it("returns an actionable company fallback without credentials", async () => {
    vi.stubEnv("CONTEXT_DEV_API_KEY", "");
    const r = await company(request({ url: "https://example.com" }));
    expect(r.status).toBe(503);
    expect(r.headers.get("Cache-Control")).toBe("no-store");
    expect((await r.json()).error).toContain("not configured");
  });
  it("requires reviewed context and remains usable without Gemini", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const payload = {
      skill: "C1.1",
      title: "Demo",
      job: "Fictional sensor role",
      reviewed: false,
    };
    expect((await examples(request(payload))).status).toBe(400);
    expect(
      (await examples(request({ ...payload, reviewed: true }))).status,
    ).toBe(503);
  });
  it("requires explicit exercise consent and a known component", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const payload = {
      skill: "C1.1",
      answer: "Fictional response",
      consent: false,
    };
    expect((await exercise(request(payload))).status).toBe(400);
    expect(
      (
        await exercise(
          request({ ...payload, skill: "invented", consent: true }),
        )
      ).status,
    ).toBe(400);
    expect(
      (await exercise(request({ ...payload, consent: true }))).status,
    ).toBe(503);
  });
});
