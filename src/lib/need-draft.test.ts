import { describe, expect, it } from "vitest";
import { COMPONENTS, JOB_SKILLS, type ExpectedLevel } from "./framework";
import { checkNeed } from "./scoring";
import { JOB_QUESTIONS, levelExample, prepareNeed, type NeedDraft } from "./need-draft";

function valid(): NeedDraft {
  return { title: "  Embedded developer  ", description: "  Build a synthetic device.  ", context: { task: "Debug a sensor", audience: "Product team", outcome: "A reproducible fix", challenge: "Intermittent failure" }, capacity: 3, requirements: COMPONENTS.slice(0, 3).map((c) => ({ skill: c.code, major: true, expected: 2 })) };
}
function errors(draft: NeedDraft) {
  const result = prepareNeed(draft);
  expect(result.ok).toBe(false);
  if (result.ok) throw new Error("Expected rejection");
  return result.errors.join(" ");
}

describe("recruiter need submission", () => {
  it("prepares a valid need with trimmed details and independent requirement copies", () => {
    const draft = valid();
    const before = structuredClone(draft);
    const result = prepareNeed(draft);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected a valid need");
    expect(checkNeed(result.need)).toEqual([]);
    expect(result.need.title).toBe("Embedded developer");
    expect(result.description).toBe("Build a synthetic device.");
    expect(result.need.capacity).toBe(3);
    expect(result.need.requirements[0].example).toContain("Debug a sensor");
    expect(draft).toEqual(before);
    result.need.requirements[0].expected = 3;
    result.context.task = "Changed";
    expect(draft).toEqual(before);
  });
  it("accepts the maximum valid combination and keeps job skills separate", () => {
    const draft = valid();
    draft.requirements.push(...COMPONENTS.slice(3, 5).map((c) => ({ skill: c.code, major: false, expected: 1 as const })), ...JOB_SKILLS.slice(0, 2).map((j) => ({ skill: j.code, major: false, expected: 3 as const })));
    expect(prepareNeed(draft).ok).toBe(true);
  });
  it.each([0, 2, 4])("rejects %i majors via checkNeed", (count) => {
    const draft = valid();
    draft.requirements = COMPONENTS.slice(0, count).map((c) => ({ skill: c.code, major: true, expected: 1 }));
    expect(errors(draft)).toContain("Pick exactly 3");
  });
  it("accepts every other component as a minor, and rejects a fourth technical skill", () => {
    const draft = valid();
    const chosen = new Set(draft.requirements.map((r) => r.skill));
    draft.requirements.push(...COMPONENTS.filter((c) => !chosen.has(c.code)).map((c) => ({ skill: c.code, major: false, expected: 1 as const })));
    expect(prepareNeed(draft).ok).toBe(true);
    draft.requirements.push(...JOB_SKILLS.filter((j) => !chosen.has(j.code)).slice(0, 4).map((j) => ({ skill: j.code, major: false, expected: 1 as const })));
    expect(errors(draft)).toContain("At most 3 job");
  });
  it("rejects job majors, duplicate skills and unknown codes", () => {
    const draft = valid();
    draft.requirements.push({ skill: JOB_SKILLS[0].code, major: true, expected: 1 });
    expect(errors(draft)).toContain("cannot be a major");
    draft.requirements = [...valid().requirements, valid().requirements[0]];
    expect(errors(draft)).toContain("Each skill only once");
    draft.requirements = [...valid().requirements, { skill: "J.INVENTED", major: false, expected: 1 }];
    expect(errors(draft)).toContain("closed list");
  });
  it.each([0, -1, 1.5, NaN, Infinity])("rejects invalid capacity %s", (capacity) => {
    expect(errors({ ...valid(), capacity })).toContain("positive whole number");
  });
  it.each([0, 4, NaN])("rejects invalid expected level %s", (level) => {
    const draft = valid();
    draft.requirements[0].expected = level as ExpectedLevel;
    expect(errors(draft)).toContain("Choose Foundation");
  });
  it("requires title and description but allows all four context questions to be skipped", () => {
    expect(errors({ ...valid(), title: " ", description: "\n" })).toContain("Enter a job title");
    expect(errors({ ...valid(), description: " " })).toContain("Enter a short job description");
    expect(prepareNeed({ ...valid(), context: { task: "", audience: "", outcome: "", challenge: "" } }).ok).toBe(true);
    expect(JOB_QUESTIONS).toHaveLength(4);
  });
});

describe("hand-written level cards", () => {
  it.each([...COMPONENTS, ...JOB_SKILLS].map((s) => s.code))("provides distinct examples for every level of %s", (code) => {
    const draft = valid();
    const examples = ([1, 2, 3] as const).map((level) => levelExample(code, level, draft));
    expect(new Set(examples).size).toBe(3);
    for (const example of examples) {
      for (const context of Object.values(draft.context)) expect(example).toContain(context);
      expect(example).toContain(draft.title.trim());
    }
  });
  it("updates context without inventing skills or making network requests", () => {
    const draft = valid();
    const before = levelExample("J.PYTHON", 1, draft);
    draft.context.task = "Process synthetic support logs";
    expect(levelExample("J.PYTHON", 1, draft)).not.toBe(before);
    expect(levelExample("J.PYTHON", 1, draft)).toContain("Process synthetic support logs");
    expect(() => levelExample("unknown", 1, draft)).toThrow();
  });
});
