import { describe, it, expect } from "vitest";
import {
  addNeed,
  saveCheckPlan,
  approveExercise,
  submitCheck,
  gradeCheck,
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
    expect(loadWorkspace(s).needs).toHaveLength(NEEDS.length);
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

it("keeps separate situations but replaces a revised grade for the same one", () => {
  const s = storage();
  const base = {
    needId: "n",
    talentId: "t",
    skill: "C5.1",
    taskLevel: 2 as const,
  };
  recordObservation(s, { ...base, observation: "A", source: "online" });
  recordObservation(s, { ...base, observation: "F", source: "interview" });
  recordObservation(s, { ...base, observation: "C", source: "online" });
  expect(loadWorkspace(s).observations).toHaveLength(2);
  expect(
    loadWorkspace(s).observations.find((o) => o.source === "online")
      ?.observation,
  ).toBe("C");
});

it("requires a current submission, resets its grade on replacement and deletes answers with the card", () => {
  const s = storage();
  const submission = {
    needId: "n",
    talentId: "local-talent",
    skill: "C5.1",
    taskLevel: 1 as const,
    answer: "Ask which sensor fails and reproduce the startup.",
  };
  expect(() => gradeCheck(s, submission, "A")).toThrow();
  submitCheck(s, submission);
  gradeCheck(s, submission, "A");
  expect(loadWorkspace(s).observations[0]).toMatchObject({
    taskLevel: 1,
    observation: "A",
    source: "online:C5.1",
  });
  submitCheck(s, { ...submission, answer: "A revised fictional answer." });
  expect(loadWorkspace(s).observations).toHaveLength(0);
  expect(() => gradeCheck(s, submission, "A")).toThrow();
  removeTalent(s, "local-talent");
  expect(loadWorkspace(s).checks).toHaveLength(0);
});

it("never records a ten-minute observation for long-term commitments", () => {
  expect(() =>
    recordObservation(storage(), {
      needId: "n",
      talentId: "t",
      skill: "C4.3",
      taskLevel: 2,
      observation: "A",
    }),
  ).toThrow("Invalid observation");
});

it("keeps the submitted exercise version when a recruiter approves a later draft", () => {
  const s = storage();
  const e = {
    skill: "C5.1",
    level: 1 as const,
    minutes: 6,
    prompt: "Original fictional sensor task",
    checks: ["Facts", "Questions", "Test"],
    sourceIds: ["job:1"],
    passages: [
      { id: "job:1", sourceId: "job", title: "Job", text: "Test sensors" },
    ],
  };
  approveExercise(s, "n", e);
  submitCheck(s, {
    needId: "n",
    talentId: "t",
    skill: e.skill,
    taskLevel: 1,
    answer: "Ask for the restart log",
    exercise: e,
  });
  approveExercise(s, "n", { ...e, prompt: "Revised fictional task" });
  expect(loadWorkspace(s).checks[0].exercise?.prompt).toBe(
    "Original fictional sensor task",
  );
  expect(loadWorkspace(s).exercises[0].exercise.prompt).toBe(
    "Revised fictional task",
  );
});

it("rejects a stale review after a new attempt even when the answer text is identical", () => {
  const s = storage();
  const base = {
    needId: "n",
    talentId: "t",
    skill: "C5.1",
    taskLevel: 1 as const,
    answer: "Ask about power and test the connection.",
    timing: { startedAt: 1000, submittedAt: 5000, allowedSeconds: 360 },
  };
  submitCheck(s, base);
  const old = loadWorkspace(s).checks[0];
  submitCheck(s, {
    ...base,
    timing: { ...base.timing, startedAt: 6000, submittedAt: 8000 },
  });
  expect(() => gradeCheck(s, old, "A")).toThrow();
  gradeCheck(s, loadWorkspace(s).checks[0], "C");
  expect(loadWorkspace(s).observations[0].observation).toBe("C");
});

it("shares a valid online plan across local roles and preserves it when an over-budget change fails", () => {
  const s = storage();
  saveCheckPlan(s, NEEDS[0], ["C5.2"]);
  expect(loadWorkspace(s).checkPlans).toEqual([
    { needId: NEEDS[0].id, skills: ["C5.2"] },
  ]);
  expect(() => saveCheckPlan(s, NEEDS[0], ["C5.2", "C5.1"])).toThrow();
  expect(loadWorkspace(s).checkPlans?.[0].skills).toEqual(["C5.2"]);
});
