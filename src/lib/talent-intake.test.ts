import { describe, it, expect } from "vitest";
import { spotSkills, suggestLevel, makeTalent } from "./talent-intake";
describe("talent declarations", () => {
  it("quotes mentions without assigning levels", () => {
    const mentions = spotSkills(
      "I used Python. I tested a sensor with my team.",
    );
    expect(mentions["J.PYTHON"]).toBe("I used Python.");
    expect(mentions["C2.2"]).toContain("tested");
    expect(mentions["C4.1"]).toContain("team");
  });
  it("ignores personal and demographic attributes", () => {
    expect(
      spotSkills(
        "Nationality: Finnish. Age: 24. Gender: female. Degree: Master of Arts.",
      ),
    ).toEqual({});
  });
  it.each([
    [{ done: "", autonomy: "", complexity: "" }, null],
    [{ done: "no", autonomy: "", complexity: "" }, 0],
    [{ done: "yes", autonomy: "", complexity: "" }, null],
    [{ done: "yes", autonomy: "help", complexity: "new" }, 1],
    [{ done: "yes", autonomy: "alone", complexity: "simple" }, 2],
    [{ done: "yes", autonomy: "alone", complexity: "new" }, 3],
  ] as const)("uses the explicit rule %o → %s", (answers, expected) =>
    expect(suggestLevel(answers)).toBe(expected),
  );
  it("creates a card without CV or quoted evidence", () => {
    const talent = makeTalent({ "C2.2": 2 }, "Demo");
    expect(talent.cv).toBe("");
    expect(talent.statements["C2.2"]).toEqual({
      level: 2,
      evidence: "declared",
    });
  });
  it("rejects invented skills or empty cards", () => {
    expect(() => makeTalent({ invented: 2 }, "Demo")).toThrow();
    expect(() => makeTalent({}, "Demo")).toThrow();
  });
});
