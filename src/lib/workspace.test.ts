import { describe, it, expect } from "vitest";
import {
  addNeed,
  addTalent,
  loadWorkspace,
  removeTalent,
  recordMeeting,
  recordObservation,
  WORKSPACE_KEY,
} from "./workspace";
import { NEEDS } from "@/data/demo";
import { makeTalent } from "./talent-intake";
function storage(): Storage {
  const values = new Map<string, string>();
  return {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => {
      values.set(k, v);
    },
    removeItem: (k) => {
      values.delete(k);
    },
    clear: () => values.clear(),
    key: (i) => [...values.keys()][i] ?? null,
    get length() {
      return values.size;
    },
  };
}
describe("local event workspace", () => {
  it("connects a valid need to the workspace and preserves distinct companies", () => {
    const s = storage();
    for (const need of NEEDS)
      addNeed(s, {
        ...need,
        description: "Demo",
        companyContext: "",
        eventName: "Espoo",
      });
    expect(loadWorkspace(s).needs).toHaveLength(2);
  });
  it("requires consent and never persists CVs or quotes", () => {
    const s = storage();
    const talent = makeTalent({ "C1.1": 1 }, "Demo");
    talent.cv = "DO NOT STORE";
    talent.statements["C1.1"].cvQuote = "PRIVATE QUOTE";
    expect(() => addTalent(s, talent, false)).toThrow();
    addTalent(s, talent, true);
    expect(s.getItem(WORKSPACE_KEY)).not.toContain("DO NOT STORE");
    expect(s.getItem(WORKSPACE_KEY)).not.toContain("PRIVATE QUOTE");
  });
  it("excludes expired cards and deletes associated observations and decisions", () => {
    const s = storage();
    const talent = makeTalent({ "C1.1": 1 }, "Demo");
    addTalent(s, talent, true, Date.UTC(2026, 0, 1));
    expect(loadWorkspace(s, Date.UTC(2026, 7, 1)).talents).toHaveLength(0);
    expect(s.getItem(WORKSPACE_KEY)).not.toContain("local-talent");
    addTalent(s, talent, true);
    recordMeeting(s, {
      needId: "n",
      talentId: talent.id,
      approved: true,
      reason: "Explore experience",
    });
    recordObservation(s, {
      needId: "n",
      talentId: talent.id,
      skill: "C1.1",
      observation: "C",
    });
    removeTalent(s, talent.id);
    expect(loadWorkspace(s)).toMatchObject({
      talents: [],
      journal: [],
      observations: [],
    });
  });
  it("requires decision reasons and retains the journal history", () => {
    const s = storage();
    expect(() =>
      recordMeeting(s, {
        needId: "n",
        talentId: "t",
        approved: true,
        reason: " ",
      }),
    ).toThrow();
    recordMeeting(s, {
      needId: "n",
      talentId: "t",
      approved: true,
      reason: "Relevant task",
    });
    recordMeeting(s, {
      needId: "n",
      talentId: "t",
      approved: false,
      reason: "Availability changed",
    });
    expect(loadWorkspace(s).journal).toHaveLength(2);
  });
  it("stores observations separately without changing declared levels", () => {
    const s = storage();
    addTalent(s, makeTalent({ "C1.1": 3 }, "Demo"), true);
    recordObservation(s, {
      needId: "n",
      talentId: "local-talent",
      skill: "C1.1",
      observation: "F",
    });
    expect(loadWorkspace(s).talents[0].talent.statements["C1.1"].level).toBe(3);
  });
  it("reports corrupt storage and write failures", () => {
    const s = storage();
    s.setItem(WORKSPACE_KEY, "garbage");
    expect(() => loadWorkspace(s)).toThrow();
    const failing = {
      ...storage(),
      setItem: () => {
        throw Error("quota");
      },
    };
    expect(() =>
      addTalent(failing, makeTalent({ "C1.1": 1 }, "Demo"), true),
    ).toThrow("quota");
  });
});
