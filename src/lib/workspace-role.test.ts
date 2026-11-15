import { expect, it } from "vitest";
import { roleForPath, roleDestination } from "./workspace-role";
it("separates candidate answers from recruiter review and preserves the check destination", () => {
  expect(roleForPath("/talent/checks")).toBe("candidate");
  expect(roleForPath("/checks")).toBe("recruiter");
  expect(roleForPath("/organiser")).toBe("organiser");
  expect(roleDestination("recruiter", "/talent/checks")).toBe("/checks");
  expect(roleDestination("candidate", "/checks")).toBe("/talent/checks");
});
