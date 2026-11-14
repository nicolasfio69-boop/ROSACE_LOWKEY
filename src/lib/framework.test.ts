import { describe, expect, it } from "vitest";
import { COMPONENTS, JOB_SKILLS, JOB_FAMILIES } from "./framework";

describe("approved framework", () => {
  it("keeps the exact twelve action names from CADRAGE section 2 bis", () => {
    expect(COMPONENTS.map(({ name, short }) => [name, short])).toEqual([
      ["Reach out to people", "Reach out"],
      ["Understand and convince", "Convince"],
      ["Know the rules and stick to them", "Follow the rules"],
      ["Get it right and spot the error", "Get it right"],
      ["Scope a job", "Scope the work"],
      ["See it through and hand it over", "See it through"],
      ["Work with others", "Work with others"],
      ["Own your decisions", "Own decisions"],
      ["Keep commitments and manage your time", "Keep commitments"],
      ["Break down a problem", "Break down problems"],
      ["Learn fast on your own", "Learn fast"],
      ["Communicate clearly", "Communicate clearly"],
    ]);
  });
  it("keeps distinct technical actions in four families", () => {
    expect(new Set(JOB_SKILLS.map(s => s.code)).size).toBe(JOB_SKILLS.length);
    expect(JOB_FAMILIES).toHaveLength(4);
    for (const skill of JOB_SKILLS) {
      expect(JOB_FAMILIES.some(f => f.code === skill.family)).toBe(true);
      expect(skill.name).toMatch(/^(Program|Use|Debug|Read|Work|Build|Write|Query|Clean|Train|Troubleshoot|Diagnose|Deploy|Support|Automate|Handle|Explain)/);
    }
  });
});
