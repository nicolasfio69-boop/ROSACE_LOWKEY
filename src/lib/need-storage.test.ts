import { describe, expect, it } from "vitest";
import { COMPONENTS } from "./framework";
import {
  decodeStoredNeed,
  emptyNeedDraft,
  NEED_STORAGE_KEY,
  saveNeed,
} from "./need-storage";

function validDraft() {
  return {
    ...emptyNeedDraft(),
    title: "Synthetic developer",
    description: "Build a demo device",
    requirements: COMPONENTS.slice(0, 3).map((c) => ({
      skill: c.code,
      major: true,
      expected: 2 as const,
    })),
  };
}
function memoryStorage() {
  const values = new Map<string, string>();
  return {
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    getItem: (key: string) => values.get(key) ?? null,
  };
}

describe("saved recruiter need", () => {
  it("restores an unfinished draft including a blank capacity", () => {
    const storage = memoryStorage();
    const draft = {
      ...emptyNeedDraft(),
      title: "Work in progress",
      capacity: NaN,
    };
    saveNeed(storage, draft, false);
    const restored = decodeStoredNeed(storage.getItem(NEED_STORAGE_KEY)!);
    expect(restored.draft).toEqual(draft);
    expect(restored.confirmed).toBe(false);
  });
  it("restores a valid confirmation and replaces it with an unconfirmed edited draft", () => {
    const storage = memoryStorage();
    const draft = validDraft();
    saveNeed(storage, draft, true);
    expect(decodeStoredNeed(storage.getItem(NEED_STORAGE_KEY)!)).toEqual({
      version: 1,
      draft,
      confirmed: true,
    });
    saveNeed(storage, { ...draft, title: "Changed job" }, false);
    expect(decodeStoredNeed(storage.getItem(NEED_STORAGE_KEY)!)).toMatchObject({
      confirmed: false,
      draft: { title: "Changed job" },
    });
  });
  it("does not persist an invalid confirmation", () => {
    const storage = memoryStorage();
    expect(() => saveNeed(storage, emptyNeedDraft(), true)).toThrow();
    expect(storage.getItem(NEED_STORAGE_KEY)).toBeNull();
  });
  it("revalidates a stored confirmation instead of trusting the flag", () => {
    expect(
      decodeStoredNeed(
        JSON.stringify({
          version: 1,
          draft: emptyNeedDraft(),
          confirmed: true,
        }),
      ).confirmed,
    ).toBe(false);
  });
  it.each([
    "{",
    "null",
    "[]",
    '{"version":2}',
    JSON.stringify({
      version: 1,
      draft: { ...validDraft(), context: null },
      confirmed: false,
    }),
    JSON.stringify({
      version: 1,
      draft: {
        ...validDraft(),
        requirements: [{ skill: "unknown", major: false, expected: 1 }],
      },
      confirmed: false,
    }),
    JSON.stringify({
      version: 1,
      draft: {
        ...validDraft(),
        requirements: [{ skill: "C1.1", major: true, expected: 9 }],
      },
      confirmed: false,
    }),
  ])("rejects malformed or unsupported storage: %s", (raw) => {
    expect(() => decodeStoredNeed(raw)).toThrow();
  });
  it("surfaces write failures so the UI cannot claim success", () => {
    const storage = {
      setItem: () => {
        throw new Error("Quota exceeded");
      },
    };
    expect(() => saveNeed(storage, validDraft(), true)).toThrow(
      "Quota exceeded",
    );
  });
  it("does not reuse mutable defaults between resets", () => {
    const first = emptyNeedDraft();
    first.context.task = "Changed";
    expect(emptyNeedDraft().context.task).toBe("");
  });
});
