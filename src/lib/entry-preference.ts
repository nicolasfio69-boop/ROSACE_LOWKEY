import type { WorkspaceRole } from "./workspace-role";

// A local navigation preference, never an identity, session or permission.
export const ENTRY_PREFERENCE_KEY = "rosace.entry-mode.v1";
export const WORKSPACE_HOMES: Record<WorkspaceRole, string> = {
  candidate: "/candidate",
  recruiter: "/recruiter",
  organiser: "/event",
};
export function readEntryPreference(
  storage: Pick<Storage, "getItem">,
): WorkspaceRole | null {
  try {
    const value = storage.getItem(ENTRY_PREFERENCE_KEY);
    return value === "candidate" ||
      value === "recruiter" ||
      value === "organiser"
      ? value
      : null;
  } catch {
    return null;
  }
}
export function rememberEntryPreference(
  storage: Pick<Storage, "setItem">,
  role: WorkspaceRole,
): boolean {
  try {
    storage.setItem(ENTRY_PREFERENCE_KEY, role);
    storage.setItem("rosace.workspace-role", role);
    return true;
  } catch {
    return false;
  }
}
