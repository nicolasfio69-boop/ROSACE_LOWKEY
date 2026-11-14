import { expect, it } from "vitest";
import {
  ENTRY_PREFERENCE_KEY,
  readEntryPreference,
  rememberEntryPreference,
  WORKSPACE_HOMES,
} from "./entry-preference";
import { roleDestination, roleForPath } from "./workspace-role";

it("remembers only a navigation mode and routes each role to its own home", () => {
  for (const role of ["candidate", "recruiter", "organiser"] as const) {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
    expect(rememberEntryPreference(storage, role)).toBe(true);
    expect(readEntryPreference(storage)).toBe(role);
    expect([...values.entries()]).toEqual([
      [ENTRY_PREFERENCE_KEY, role],
      ["rosace.workspace-role", role],
    ]);
    expect(roleForPath(WORKSPACE_HOMES[role])).toBe(role);
    expect(roleDestination(role, "/tour")).toBe(WORKSPACE_HOMES[role]);
  }
});

it.each([null, "", "admin", "/checks", '{"role":"candidate"}', "CANDIDATE"])(
  "ignores invalid or obsolete entry preference %s",
  (value) => {
    expect(readEntryPreference({ getItem: () => value })).toBeNull();
  },
);

it("allows a fresh choice when browser storage is unavailable", () => {
  const denied = () => {
    throw new Error("Storage denied");
  };
  expect(readEntryPreference({ getItem: denied })).toBeNull();
  expect(rememberEntryPreference({ setItem: denied }, "candidate")).toBe(false);
});
