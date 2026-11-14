import { describe, expect, it } from "vitest";
import { changeSelection } from "./need-selection";
import { type Requirement } from "./scoring";

const majors: Requirement[] = ["C1.1", "C1.2", "C2.1"].map((skill) => ({
  skill,
  major: true,
  expected: 2,
}));
describe("guided priority selection", () => {
  it("blocks a fourth major, then allows a replacement after removal", () => {
    expect(changeSelection(majors, "C2.2", "major")).toBe(majors);
    const next = changeSelection(
      changeSelection(majors, "C1.1", "none"),
      "C2.2",
      "major",
    );
    expect(next.map((r) => r.skill)).toEqual(["C1.2", "C2.1", "C2.2"]);
    expect(majors).toHaveLength(3);
  });
  it("preserves the expected level when promoting a minor", () => {
    const current: Requirement[] = [
      { skill: "C1.1", major: false, expected: 3 },
    ];
    expect(changeSelection(current, "C1.1", "major")).toEqual([
      { skill: "C1.1", major: true, expected: 3 },
    ]);
    expect(current[0].major).toBe(false);
  });
  it("does not remove a major when the minor limit blocks a demotion", () => {
    const current: Requirement[] = [
      ...majors,
      { skill: "C2.2", major: false, expected: 1 },
      { skill: "C3.1", major: false, expected: 1 },
    ];
    expect(changeSelection(current, "C1.1", "minor")).toBe(current);
  });
  it("caps job skills separately and never allows them as majors", () => {
    const current = changeSelection(
      changeSelection(majors, "J.PYTHON", "job"),
      "J.LINUX",
      "job",
    );
    expect(changeSelection(current, "J.PROTOCOLS", "job")).toBe(current);
    expect(changeSelection(current, "J.PYTHON", "major")).toBe(current);
    expect(changeSelection(current, "C3.1", "job")).toBe(current);
  });
  it("ignores unknown codes and does not duplicate reselections", () => {
    expect(changeSelection(majors, "invented", "major")).toBe(majors);
    expect(changeSelection(majors, "C1.1", "major")).toHaveLength(3);
  });
});
