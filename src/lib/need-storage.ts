import { SKILL_CODES } from "./framework";
import { JOB_QUESTIONS, prepareNeed, type NeedDraft } from "./need-draft";

export const NEED_STORAGE_KEY = "rosace.recruiter-need.v1";
export type StoredNeed = { version: 1; draft: NeedDraft; confirmed: boolean };

export function emptyNeedDraft(): NeedDraft {
  return { title: "", description: "", context: { task: "", audience: "", outcome: "", challenge: "" }, capacity: 3, requirements: [] };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Browser storage is untrusted; check it before it reaches the form or chart. */
export function decodeStoredNeed(raw: string): StoredNeed {
  const value: unknown = JSON.parse(raw);
  if (!record(value) || value.version !== 1 || typeof value.confirmed !== "boolean" || !record(value.draft)) throw new Error("Unsupported saved need.");
  const draft = value.draft;
  const context = draft.context;
  if (typeof draft.title !== "string" || draft.title.length > 120 || typeof draft.description !== "string" || draft.description.length > 1000 || !record(context) || !JOB_QUESTIONS.every(({ key }) => typeof context[key] === "string" && context[key].length <= 240)) throw new Error("Invalid job details.");
  if (draft.capacity !== null && (typeof draft.capacity !== "number" || !Number.isFinite(draft.capacity))) throw new Error("Invalid capacity.");
  if (!Array.isArray(draft.requirements) || draft.requirements.length > 7 || !draft.requirements.every((r: unknown) => record(r) && typeof r.skill === "string" && SKILL_CODES.has(r.skill) && typeof r.major === "boolean" && [1, 2, 3].includes(r.expected as number))) throw new Error("Invalid requirements.");
  const restored: NeedDraft = {
    title: draft.title,
    description: draft.description,
    context: { task: context.task as string, audience: context.audience as string, outcome: context.outcome as string, challenge: context.challenge as string },
    capacity: draft.capacity === null ? NaN : draft.capacity as number,
    requirements: draft.requirements.map(({ skill, major, expected }) => ({ skill, major, expected })),
  };
  return { version: 1, draft: restored, confirmed: value.confirmed && prepareNeed(restored).ok };
}

/** Inject storage so failures and reloads can be exercised without a browser. */
export function saveNeed(storage: Pick<Storage, "setItem">, draft: NeedDraft, confirmed: boolean): void {
  if (confirmed && !prepareNeed(draft).ok) throw new Error("Cannot save an invalid confirmation.");
  storage.setItem(NEED_STORAGE_KEY, JSON.stringify({ version: 1, draft, confirmed }));
}
