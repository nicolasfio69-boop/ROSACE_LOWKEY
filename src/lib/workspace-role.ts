export type WorkspaceRole = "candidate" | "recruiter" | "organiser";
export function roleForPath(path: string): WorkspaceRole | null {
  if (path === "/candidate" || path.startsWith("/talent/")) return "candidate";
  if (path === "/organiser" || path === "/event") return "organiser";
  if (
    path === "/recruiter" ||
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
    candidate: "/candidate",
    recruiter: "/recruiter",
    organiser: "/event",
  }[role];
}
