import { describe, it, expect } from "vitest";
import { retrievePassages, validateExamples } from "./context";
describe("reviewed context retrieval", () => {
  it("retrieves relevant passages with stable source IDs and no invented links", () => {
    const sources = [
      {
        id: "company",
        title: "Company",
        text: "A fictional organisation makes sensors.",
      },
      {
        id: "job",
        title: "Job",
        text: "Quality tests check sensor disconnects and timeout requirements.",
      },
    ];
    const passages = retrievePassages(
      sources,
      "C2.2",
      "test sensor disconnects",
    );
    expect(passages[0].id).toBe("job:1");
    expect(passages[0].text).toContain("timeout");
    expect(passages[0].url).toBeUndefined();
  });
  it("returns no context for unknown skills and bounds long sources", () => {
    expect(
      retrievePassages([{ id: "x", title: "x", text: "test" }], "unknown", ""),
    ).toEqual([]);
    const passages = retrievePassages(
      [{ id: "x", title: "x", text: "test ".repeat(9000) }],
      "C2.2",
      "test",
    );
    expect(passages).toHaveLength(4);
    expect(passages.every((p) => p.text.length <= 900)).toBe(true);
  });
  it("rejects fabricated citations or incomplete example sets", () => {
    const passages = retrievePassages(
      [{ id: "job", title: "Job", text: "test sensors" }],
      "C2.2",
      "",
    );
    expect(() =>
      validateExamples(
        { examples: { 1: "a", 2: "b", 3: "c" }, sourceIds: ["invented"] },
        passages,
      ),
    ).toThrow();
    expect(() =>
      validateExamples(
        { examples: { 1: "a" }, sourceIds: ["job:1"] },
        passages,
      ),
    ).toThrow();
    expect(() =>
      validateExamples(
        { examples: { 1: "a", 2: "b", 3: "c" }, sourceIds: [] },
        passages,
      ),
    ).toThrow();
    expect(
      validateExamples(
        { examples: { 1: "a", 2: "b", 3: "c" }, sourceIds: ["job:1"] },
        passages,
      ).examples[2],
    ).toBe("b");
  });
});
