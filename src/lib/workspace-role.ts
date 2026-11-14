export type WorkspaceRole = "candidate" | "recruiter" | "organiser";
export function roleForPath(path: string): WorkspaceRole | null {
  if (path.startsWith("/talent/")) return "candidate";
  if (path === "/organiser") return "organiser";
  if (
    path.startsWith("/need/") ||
    ["/checks", "/brief", "/conversations"].includes(path)
  )
    return "recruiter";
  return null;
}
export function roleDestination(
  role: WorkspaceRole,
  currentPath: string,
): string {
  if (
    role !== "organiser" &&
    ["/checks", "/talent/checks"].includes(currentPath)
  )
    return role === "candidate" ? "/talent/checks" : "/checks";
  return {
    candidate: "/talent/new",
    recruiter: "/need/new",
    organiser: "/organiser",
  }[role];
}
