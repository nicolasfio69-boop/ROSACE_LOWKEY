import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { companyUrl, parseCompanyResponse, collectCompany } from "./company";
import { generateExamples } from "./ai-examples";
import { readRequest } from "./http";
beforeEach(() => vi.stubEnv("AI_PROVIDER", "gemini"));
afterEach(() => vi.unstubAllEnvs());
describe("company context integration", () => {
  it.each([
    "http://example.com",
    "https://localhost",
    "https://127.0.0.1",
    "https://[::1]",
    "https://example.com:8443",
    "https://user:pass@example.com",
    "https://team.internal",
    "https://linkedin.com/in/person",
  ])("rejects unsuitable URL %s", (url) =>
    expect(() => companyUrl(url)).toThrow(),
  );
  it("normalises the requested public company URL", () =>
    expect(companyUrl("https://example.com/about?tracking=1#team")).toBe(
      "https://example.com/about",
    ));
  it("checks provider output success even when HTTP succeeded", () => {
    expect(() =>
      parseCompanyResponse(
        { markdown: { success: false, data: "bad" } },
        "https://example.com",
      ),
    ).toThrow();
    expect(
      parseCompanyResponse(
        { markdown: { success: true, data: "Company products" } },
        "https://example.com",
      ).text,
    ).toBe("Company products");
  });
  it("does not issue a request without credentials", async () => {
    vi.stubEnv("CONTEXT_DEV_API_KEY", "");
    const f = vi.fn();
    await expect(collectCompany("https://example.com", f)).rejects.toThrow(
      "not configured",
    );
    expect(f).not.toHaveBeenCalled();
  });
  it("calls the documented endpoint and returns source provenance", async () => {
    vi.stubEnv("CONTEXT_DEV_API_KEY", "test-key");
    const f = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          markdown: { success: true, data: "Fictional sensor company" },
          metadata: { title: "Demo" },
        }),
      ),
    );
    const r = await collectCompany("https://example.org/about", f);
    expect(r.source.url).toBe("https://example.org/about");
    expect(r.source.fetchedAt).toBeTruthy();
    expect(f.mock.calls[0][0]).toBe("https://api.context.dev/v1/web/scrape");
    expect(JSON.parse(f.mock.calls[0][1].body)).toMatchObject({
      formats: { markdown: true },
      maxAgeMs: 0,
    });
  });
});
describe("Gemini boundary", () => {
  it("keeps manual operation available when unconfigured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const f = vi.fn();
    await expect(
      generateExamples(
        "C1.1",
        "Demo",
        "",
        [{ id: "job", title: "Demo", text: "Synthetic task" }],
        f,
      ),
    ).rejects.toThrow("not configured");
    expect(f).not.toHaveBeenCalled();
  });
  it("validates model output against the retrieved sources", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("GEMINI_MODEL", "test-model");
    const f = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              finishReason: "STOP",
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      examples: {
                        1: "With help",
                        2: "Alone",
                        3: "New situations",
                      },
                      sourceIds: ["job:1"],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      ),
    );
    const r = await generateExamples(
      "C2.2",
      "Demo",
      "test",
      [{ id: "job", title: "Job", text: "Test sensors" }],
      f,
    );
    expect(r.sourceIds).toEqual(["job:1"]);
    const payload = JSON.parse(f.mock.calls[0][1].body);
    expect(payload.systemInstruction.parts[0].text).toContain("untrusted data");
    expect(payload.contents[0].parts[0].text).not.toContain("cvQuote");
  });
  it("rejects unknown skills before calling the model", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("GEMINI_MODEL", "test-model");
    const f = vi.fn();
    await expect(
      generateExamples("invented", "Demo", "", [], f),
    ).rejects.toThrow("Unknown");
    expect(f).not.toHaveBeenCalled();
  });
  it("rejects cross-origin and oversized requests", async () => {
    await expect(
      readRequest(
        new Request("http://localhost/api", {
          method: "POST",
          headers: { origin: "https://other.example" },
          body: "{}",
        }),
      ),
    ).rejects.toThrow("Cross-origin");
    await expect(
      readRequest(
        new Request("http://localhost/api", {
          method: "POST",
          body: JSON.stringify({ text: "x".repeat(65000) }),
        }),
      ),
    ).rejects.toThrow("too large");
  });
});
