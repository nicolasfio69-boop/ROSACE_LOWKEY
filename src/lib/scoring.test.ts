import { describe, expect, it } from "vitest";
import { NEEDS, TALENTS } from "@/data/demo";
import { COMPONENTS, JOB_SKILLS, SKILL_CODES } from "./framework";
import { align, observedValue } from "./scoring";
import { suggestForNeed, withoutSuggestion } from "./suggestions";

const need = (id: string) => NEEDS.find((n) => n.id === id)!;
const talent = (id: string) => TALENTS.find((t) => t.id === id)!;

describe("framework", () => {
  it("keeps the 12 Centrale components with three descriptors each", () => {
    expect(COMPONENTS).toHaveLength(12);
    for (const component of COMPONENTS) {
      expect(Object.keys(component.descriptors)).toEqual(["1", "2", "3"]);
    }
  });

  it("only uses known skill codes in the demo data", () => {
    for (const n of NEEDS) for (const r of n.requirements) expect(SKILL_CODES.has(r.skill)).toBe(true);
    for (const t of TALENTS) for (const code of Object.keys(t.statements)) expect(SKILL_CODES.has(code)).toBe(true);
    expect(JOB_SKILLS.length).toBeGreaterThan(0);
  });
});

describe("declared alignment (worked example of the reference document)", () => {
  it("talent A: 11 out of 15, 7 of 8 weights covered, complete", () => {
    const a = align(need("nordchip-embedded"), talent("amira"));
    expect([a.points, a.max]).toEqual([11, 15]);
    expect([a.coveredWeight, a.totalWeight]).toEqual([7, 8]);
    expect(a.complete).toBe(true);
  });

  it("talent B: 10 out of 15, 5 of 8 weights covered, incomplete", () => {
    const b = align(need("nordchip-embedded"), talent("jonas"));
    expect([b.points, b.max]).toEqual([10, 15]);
    expect([b.coveredWeight, b.totalWeight]).toEqual([5, 8]);
    expect(b.complete).toBe(false);
    expect(b.missingMajors).toContain("J.EMBEDDED_C");
  });

  it("caps the level at the expected level, and shows what is above", () => {
    const a = align(need("nordchip-embedded"), talent("amira"));
    const embedded = a.rows.find((r) => r.requirement.skill === "J.EMBEDDED_C")!;
    expect(embedded.level).toBe(3);
    expect(embedded.points).toBe(4);
    expect(a.aboveExpected).toEqual(["J.EMBEDDED_C"]);
  });

  it("a CV mention without detail counts as unknown, not as a level", () => {
    const a = align(need("nordchip-embedded"), talent("amira"));
    const protocols = a.rows.find((r) => r.requirement.skill === "J.PROTOCOLS")!;
    expect(protocols.status).toBe("mentioned");
    expect(protocols.points).toBe(0);
  });

  it("a supporting link never changes the points", () => {
    const withLink = talent("amira");
    const withoutLink = {
      ...withLink,
      statements: { ...withLink.statements, "J.EMBEDDED_C": { level: 3 as const, evidence: "declared" as const } },
    };
    expect(align(need("nordchip-embedded"), withoutLink).points).toBe(align(need("nordchip-embedded"), withLink).points);
  });

  it("lists major requirements that are unknown or below expectations, even with a good total", () => {
    const m = align(need("nordchip-embedded"), talent("mateo"));
    expect(m.complete).toBe(true);
    expect(m.missingMajors).toEqual(["J.EMBEDDED_C", "C5.1"]);
  });
});

describe("observation grid", () => {
  it("uses the Centrale formula: level × performance, not covered yields nothing", () => {
    expect(observedValue(2, "A")).toBe(2);
    expect(observedValue(2, "C")).toBeCloseTo(1.2);
    expect(observedValue(3, "F")).toBe(0);
    expect(observedValue(2, "NE")).toBeNull();
  });
});

describe("suggestions", () => {
  it("suggests the best aligned eligible talents up to the capacity", () => {
    const result = suggestForNeed(need("nordchip-embedded"), TALENTS);
    expect(result.suggested.map((a) => a.talentId)).toEqual(["lin", "amira", "sofia"]);
    expect(result.tied).toEqual([]);
  });

  it("never breaks a tie at the cut: tied talents go to the organiser", () => {
    const result = suggestForNeed(need("lumora-support"), TALENTS);
    expect(result.suggested.map((a) => a.talentId)).toEqual(["mateo", "sofia"]);
    expect(result.tied.map((a) => a.talentId).sort()).toEqual(["amira", "lin"]);
  });

  it("shows the organiser who has no suggestion, and why", () => {
    const results = NEEDS.map((n) => suggestForNeed(n, TALENTS));
    const missing = withoutSuggestion(results, TALENTS);
    expect(missing.map((m) => [m.talent.id, m.reason])).toEqual([
      ["jonas", "card_too_sparse"],
      ["kwame", "card_too_sparse"],
    ]);
  });
});
