import type { JobContext } from "./need-draft";
import { SKILL_CODES } from "./framework";
import { checkNeed, type Need, type Talent, type Observation } from "./scoring";

export const WORKSPACE_KEY = "rosace.event-workspace.v1";
export type LocalNeed = Need & {
  description: string;
  eventName: string;
  companyContext: string;
  sourceUrl?: string;
  context?: JobContext;
  workMode?: string;
  location?: string;
  autonomy?: string;
};
export type SavedTalent = { talent: Talent; expiresAt: number };
export type Meeting = {
  needId: string;
  talentId: string;
  approved: boolean;
  reason: string;
  at: string;
};
export type Seen = {
  needId: string;
  talentId: string;
  skill: string;
  observation: Observation;
};
export type Workspace = {
  version: 1;
  needs: LocalNeed[];
  talents: SavedTalent[];
  journal: Meeting[];
  observations: Seen[];
};
export function emptyWorkspace(): Workspace {
  return { version: 1, needs: [], talents: [], journal: [], observations: [] };
}
function object(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
export function validNeed(v: unknown): v is LocalNeed {
  if (
    !object(v) ||
    typeof v.id !== "string" ||
    typeof v.title !== "string" ||
    typeof v.company !== "string" ||
    typeof v.description !== "string" ||
    typeof v.eventName !== "string" ||
    typeof v.companyContext !== "string" ||
    !Number.isSafeInteger(v.capacity) ||
    (v.capacity as number) < 1 ||
    !Array.isArray(v.requirements)
  )
    return false;
  if (
    v.requirements.some(
      (r) =>
        !object(r) ||
        typeof r.skill !== "string" ||
        !SKILL_CODES.has(r.skill) ||
        typeof r.major !== "boolean" ||
        ![1, 2, 3].includes(r.expected as number),
    )
  )
    return false;
  return checkNeed(v as LocalNeed).length === 0;
}
function cleanTalent(v: unknown): Talent | null {
  if (
    !object(v) ||
    typeof v.id !== "string" ||
    typeof v.pseudonym !== "string" ||
    !object(v.statements)
  )
    return null;
  const statements: Talent["statements"] = {};
  for (const [code, s] of Object.entries(v.statements)) {
    if (
      !SKILL_CODES.has(code) ||
      !object(s) ||
      ![0, 1, 2, 3].includes(s.level as number)
    )
      return null;
    statements[code] = {
      level: s.level as 0 | 1 | 2 | 3,
      evidence: "declared",
    };
  }
  return { id: v.id, pseudonym: v.pseudonym.slice(0, 80), cv: "", statements };
}
export function loadWorkspace(
  storage: Pick<Storage, "getItem"> & Partial<Pick<Storage, "setItem">>,
  now = Date.now(),
): Workspace {
  const raw = storage.getItem(WORKSPACE_KEY);
  if (!raw) return emptyWorkspace();
  const value: unknown = JSON.parse(raw);
  if (
    !object(value) ||
    value.version !== 1 ||
    !Array.isArray(value.needs) ||
    !Array.isArray(value.talents) ||
    !Array.isArray(value.journal) ||
    !Array.isArray(value.observations)
  )
    throw new Error(
      "Saved demo data could not be read. Clear the local workspace to start again.",
    );
  const needs = value.needs.filter(validNeed);
  const expiredIds = new Set(
    value.talents.flatMap((item) =>
      object(item) &&
      typeof item.expiresAt === "number" &&
      item.expiresAt <= now &&
      object(item.talent) &&
      typeof item.talent.id === "string"
        ? [item.talent.id]
        : [],
    ),
  );
  const talents = value.talents.flatMap((item) => {
    if (
      !object(item) ||
      typeof item.expiresAt !== "number" ||
      !Number.isFinite(item.expiresAt) ||
      item.expiresAt <= now
    )
      return [];
    const talent = cleanTalent(item.talent);
    return talent ? [{ talent, expiresAt: item.expiresAt }] : [];
  });
  const journal = value.journal.filter(
    (m): m is Meeting =>
      object(m) &&
      !expiredIds.has(m.talentId as string) &&
      typeof m.needId === "string" &&
      typeof m.talentId === "string" &&
      typeof m.approved === "boolean" &&
      typeof m.reason === "string" &&
      typeof m.at === "string",
  );
  const observations = value.observations.filter(
    (s): s is Seen =>
      object(s) &&
      !expiredIds.has(s.talentId as string) &&
      typeof s.needId === "string" &&
      typeof s.talentId === "string" &&
      typeof s.skill === "string" &&
      SKILL_CODES.has(s.skill) &&
      ["A", "C", "F", "NE"].includes(s.observation as string),
  );
  const cleaned: Workspace = {
    version: 1,
    needs,
    talents,
    journal,
    observations,
  };
  if (expiredIds.size && storage.setItem)
    storage.setItem(WORKSPACE_KEY, JSON.stringify(cleaned));
  return cleaned;
}
export function writeWorkspace(
  storage: Pick<Storage, "setItem">,
  workspace: Workspace,
) {
  storage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
}
export function addNeed(storage: Storage, need: LocalNeed) {
  if (!validNeed(need)) throw new Error("Invalid need.");
  const w = loadWorkspace(storage);
  w.needs = [...w.needs.filter((n) => n.id !== need.id), need];
  writeWorkspace(storage, w);
}
export function addTalent(
  storage: Storage,
  talent: Talent,
  consent: boolean,
  now = Date.now(),
) {
  if (!consent) throw new Error("Saving a talent card requires consent.");
  const clean = cleanTalent(talent);
  if (!clean) throw new Error("Invalid talent card.");
  const w = loadWorkspace(storage, now);
  const expires = new Date(now);
  expires.setUTCMonth(expires.getUTCMonth() + 6);
  w.talents = [
    ...w.talents.filter((t) => t.talent.id !== clean.id),
    { talent: clean, expiresAt: expires.getTime() },
  ];
  writeWorkspace(storage, w);
}
export function removeTalent(storage: Storage, id: string) {
  const w = loadWorkspace(storage);
  w.talents = w.talents.filter((t) => t.talent.id !== id);
  w.journal = w.journal.filter((m) => m.talentId !== id);
  w.observations = w.observations.filter((m) => m.talentId !== id);
  writeWorkspace(storage, w);
}
export function recordMeeting(storage: Storage, meeting: Omit<Meeting, "at">) {
  if (!meeting.reason.trim()) throw new Error("Add a one-line reason.");
  const w = loadWorkspace(storage);
  w.journal.push({
    ...meeting,
    reason: meeting.reason.trim().slice(0, 300),
    at: new Date().toISOString(),
  });
  writeWorkspace(storage, w);
}
export function recordObservation(storage: Storage, seen: Seen) {
  if (
    !["A", "C", "F", "NE"].includes(seen.observation) ||
    !SKILL_CODES.has(seen.skill)
  )
    throw new Error("Invalid observation.");
  const w = loadWorkspace(storage);
  w.observations = w.observations.filter(
    (s) =>
      !(
        s.needId === seen.needId &&
        s.talentId === seen.talentId &&
        s.skill === seen.skill
      ),
  );
  w.observations.push(seen);
  writeWorkspace(storage, w);
}
