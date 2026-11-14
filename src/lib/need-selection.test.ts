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
  it("lets every other component be a minor, as in the Centrale grid", () => {
    const others = ["C2.2", "C3.1", "C3.2", "C4.1", "C4.2", "C4.3", "C5.1", "C5.2", "C5.3"];
    const current = others.reduce<Requirement[]>((list, skill) => changeSelection(list, skill, "minor"), majors);
    expect(current.filter((r) => !r.major)).toHaveLength(9);
    expect(changeSelection(majors, "C1.1", "minor").filter((r) => !r.major)).toHaveLength(1);
  });
  it("caps job skills separately and never allows them as majors", () => {
    const current = ["J.PYTHON", "J.LINUX", "J.GIT"].reduce<Requirement[]>(
      (list, skill) => changeSelection(list, skill, "job"),
      majors,
    );
    expect(current.filter((r) => r.skill.startsWith("J."))).toHaveLength(3);
    expect(changeSelection(current, "J.PROTOCOLS", "job")).toBe(current);
    expect(changeSelection(current, "J.PYTHON", "major")).toBe(current);
    expect(changeSelection(current, "C3.1", "job")).toBe(current);
  });
  it("ignores unknown codes and does not duplicate reselections", () => {
    expect(changeSelection(majors, "invented", "major")).toBe(majors);
    expect(changeSelection(majors, "C1.1", "major")).toHaveLength(3);
  });
});
