import { test, expect } from "@playwright/test";

test("a fictional sign-in preview remembers a workspace, never an identity", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "What brings you here?" }),
  ).toBeFocused();
  await expect(
    page.getByRole("navigation", { name: "Workspace navigation" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /Choose candidate/ }).click();
  await expect(page.getByLabel("Demo email")).toHaveValue(
    "candidate@example.test",
  );
  await expect(page.getByLabel("Demo email")).toHaveAttribute("readonly", "");
  expect(
    await page.evaluate(() => localStorage.getItem("rosace.entry-mode.v1")),
  ).toBeNull();
  await page
    .getByRole("button", { name: "Preview email-code sign-in" })
    .click();
  await page.getByLabel("Demo verification code").fill("000000");
  await page
    .getByRole("button", { name: "Open candidate workspace", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Use the displayed demo code" }),
  ).toContainText("123456");
  await page.getByLabel("Demo verification code").fill("123456");
  await page
    .getByRole("button", { name: "Open candidate workspace", exact: true })
    .click();
  await expect(page).toHaveURL(/\/candidate$/);
  const stored = await page.evaluate(() => ({ ...localStorage }));
  expect(stored["rosace.entry-mode.v1"]).toBe("candidate");
  expect(JSON.stringify(stored)).not.toMatch(/example\.test|123456/);
  expect(posts).toEqual([]);
  await page.goto("/");
  await expect(page).toHaveURL(/\/candidate$/);
  await page.getByRole("link", { name: "Build my skills card" }).click();
  await expect(page).toHaveURL(/\/talent\/new$/);
  await page
    .getByRole("button", { name: /Demo profile$/, exact: true })
    .click();
  await page.getByRole("link", { name: "Back to welcome" }).click();
  await expect(
    page.getByRole("heading", { name: "What brings you here?" }),
  ).toBeVisible();
});

test("recruiters and organisers can skip the preview; the public demo needs no role", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Explore the demo", exact: true })
    .click();
  await expect(page).toHaveURL(/\/tour$/);
  expect(
    await page.evaluate(() => localStorage.getItem("rosace.entry-mode.v1")),
  ).toBeNull();
  await page.goto("/");
  await page.getByRole("button", { name: /Choose recruiter/ }).click();
  await page.getByRole("button", { name: "Skip sign-in preview" }).click();
  await expect(page).toHaveURL(/\/recruiter$/);
  await page.getByRole("link", { name: "Define a recruiter need" }).click();
  await expect(page).toHaveURL(/\/need\/new$/);
  await page.goto("/?choose=1");
  await page.getByRole("button", { name: "Organiser access" }).click();
  await expect(
    page.getByText(/Organiser accounts will be invitation-only/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip sign-in preview" }).click();
  await expect(page).toHaveURL(/\/event$/);
  await page.getByRole("link", { name: "Open the event desk" }).click();
  await expect(page).toHaveURL(/\/organiser$/);
});

test("denied storage does not block access or imply authenticated permissions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Denied", "SecurityError");
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Choose candidate/ }).click();
  await page.getByRole("button", { name: "Skip sign-in preview" }).click();
  await expect(page).toHaveURL(/\/candidate$/);
  await expect(
    page.getByRole("link", { name: "Build my skills card" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Demo profile$/, exact: true })
    .click();
  await expect(
    page.getByText(
      "Fictional profiles. No authenticated accounts or access permissions.",
    ),
  ).toBeVisible();
});

test("welcome, code preview and workspace menus fit narrow screens and support keyboard use", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  async function fits(name: string, width: number) {
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      name,
    ).toBeLessThanOrEqual(width + 1);
    await page.screenshot({
      path: info.outputPath(`${name}-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?choose=1");
    await expect(
      page.getByRole("heading", { name: "What brings you here?" }),
    ).toBeVisible();
    await fits("welcome", width);
    const recruiter = page.getByRole("button", { name: /Choose recruiter/ });
    await recruiter.focus();
    await page.keyboard.press("Enter");
    await fits("email", width);
    await page
      .getByRole("button", { name: "Preview email-code sign-in" })
      .click();
    await fits("code", width);
    await page.getByRole("button", { name: "Skip sign-in preview" }).click();
    await expect(page).toHaveURL(/\/recruiter$/);
    await fits("recruiter", width);
    const profile = page.getByRole("button", {
      name: /Demo profile$/,
      exact: true,
    });
    await profile.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", {
        name: /^Candidate(?: Current)?$/,
        exact: true,
      }),
    ).toBeVisible();
    await fits("profile", width);
    await page.keyboard.press("Escape");
    await expect(profile).toBeFocused();
    await expect(profile).toHaveAttribute("aria-expanded", "false");
    await profile.click();
    await page
      .getByRole("button", { name: /^Candidate(?: Current)?$/, exact: true })
      .click();
    await expect(page).toHaveURL(/\/candidate$/);
    await fits("candidate", width);
  }
  expect(errors).toEqual([]);
});
