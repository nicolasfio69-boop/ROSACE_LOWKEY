import { describe, it, expect } from "vitest";
import { prepareConversation } from "./conversation";
import { NEEDS, TALENTS } from "@/data/demo";
import { align } from "./scoring";
describe("conversation preparation", () => {
  it("brings an unknown job skill forward without treating it as zero", () => {
    const brief = prepareConversation(NEEDS[0], TALENTS[0]);
    expect(brief.questions[0]).toMatchObject({
      skill: "J.PROTOCOLS",
      declared: "Not filled in",
      status: "mentioned",
    });
    expect(brief.questions[0].followUp).toContain("not done this yet");
    expect(brief.alignment).toEqual(align(NEEDS[0], TALENTS[0]));
  });
  it("keeps the three majors and up to two job skills, with job-specific examples", () => {
    const brief = prepareConversation(NEEDS[0], TALENTS[0]);
    expect(brief.questions).toHaveLength(5);
    expect(brief.questions.filter((q) => q.major)).toHaveLength(3);
    expect(brief.questions.find((q) => q.skill === "C5.1")?.example).toContain(
      "bug a customer",
    );
  });
  it("distinguishes Not yet from missing data and never invents ability", () => {
    const talent = {
      id: "demo",
      pseudonym: "Demo",
      cv: "",
      statements: { "C5.1": { level: 0 as const } },
    };
    const brief = prepareConversation(NEEDS[0], talent);
    expect(brief.questions.find((q) => q.skill === "C5.1")).toMatchObject({
      declared: "Not yet",
      status: "below",
    });
    expect(brief.connections).toEqual([]);
    expect(brief.unknown).not.toContain("Frame a problem");
  });
  it("does not mutate the need or talent", () => {
    const before = JSON.stringify([NEEDS, TALENTS]);
    prepareConversation(NEEDS[0], TALENTS[0]);
    expect(JSON.stringify([NEEDS, TALENTS])).toBe(before);
  });
});
