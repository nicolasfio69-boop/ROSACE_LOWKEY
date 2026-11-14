import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  page.setDefaultTimeout(15000);
});

const routes = [
  ["home", "/"],
  ["tour", "/tour"],
  ["need", "/need/new"],
  ["talent", "/talent/new"],
  ["organiser", "/organiser"],
  ["brief", "/brief?need=nordchip-embedded&talent=amira"],
  ["checks", "/checks"],
  ["candidate-checks", "/talent/checks"],
] as const;

test("need supports three technical skills and four minors, with verification guidance", async ({
  page,
}) => {
  await page.goto("/need/new");
  await page.getByRole("button", { name: "Try a fictional role" }).click();
  await page
    .getByRole("button", { name: "2 12 components", exact: true })
    .click();
  for (let i = 0; i < 7; i++) {
    await page
      .getByRole("button", {
        name: i < 3 ? "Major · gold" : "Minor · red",
        exact: true,
      })
      .click();
    if (i < 6)
      await page
        .getByRole("button", { name: "Next component", exact: false })
        .click();
  }
  await page.getByRole("button", { name: "3 Job skills", exact: true }).click();
  for (const name of [
    "Program embedded systems in C",
    "Use communication protocols (UART, SPI, I2C, CAN)",
    "Build data pipelines",
  ])
    await page.getByRole("checkbox", { name, exact: true }).check();
  await expect(
    page.getByRole("checkbox", {
      name: "Work with Git and code review",
      exact: true,
    }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "4 Review", exact: true }).click();
  await expect(
    page.locator(".review-list").getByText(/How it’s checked:/),
  ).toHaveCount(10);
  await page.getByRole("button", { name: "Confirm and save need" }).click();
  await expect(
    page.getByText("Need confirmed and saved", { exact: true }),
  ).toBeVisible();
  const requirements = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("rosace.event-workspace.v1")!).needs[0]
        .requirements as { skill: string; major: boolean }[],
  );
  expect(requirements.filter((r) => r.major)).toHaveLength(3);
  expect(
    requirements.filter((r) => !r.major && r.skill.startsWith("C")),
  ).toHaveLength(4);
  expect(requirements.filter((r) => r.skill.startsWith("J."))).toHaveLength(3);
});

test("human grade A makes the correct task-level branch solid and survives reload", async ({
  page,
}, info) => {
  let paidCalls = 0;
  page.on("request", (r) => {
    if (r.url().includes("/api/exercise-feedback")) paidCalls++;
  });
  await page.goto("/talent/checks");
  await page
    .getByLabel("Your exercise answer", { exact: true })
    .fill(
      "I would ask which sensor fails, check power and capture startup logs before choosing a cause.",
    );
  await page
    .getByRole("button", { name: "Submit for recruiter review", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Done");
  await page
    .getByRole("combobox", { name: "Workspace role", exact: true })
    .selectOption("recruiter");
  await page
    .getByRole("button", { name: "A — Seen clearly", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Graded");
  const bar = page
    .locator('.rosace-branch[data-skill="C5.1"][data-evidence="observed"]')
    .first();
  await expect(bar).toHaveAttribute("data-level", "1");
  expect(await bar.getAttribute("stroke-dasharray")).toBeNull();
  await page.screenshot({
    path: info.outputPath("checks-graded.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.reload();
  await expect(bar).toHaveAttribute("data-level", "1");
  await page
    .getByRole("combobox", { name: "Workspace role", exact: true })
    .selectOption("recruiter");
  await expect(
    page.getByRole("button", { name: "A — Seen clearly", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByText("Optional Claude feedback", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Request AI feedback", exact: true }),
  ).toBeDisabled();
  expect(paidCalls).toBe(0);
  await page.goto("/brief?need=nordchip-embedded&talent=amira");
  await page
    .getByRole("button", { name: "02 · Record observations", exact: true })
    .click();
  await page
    .locator(".observation-row")
    .filter({ hasText: "Break down a problem" })
    .locator("select")
    .selectOption("C");
  await expect(
    page.locator('[data-evidence="observed"][data-skill="C5.1"]').first(),
  ).toHaveAttribute("data-level", "1.1");
  await page
    .getByText("Compare with the original declaration", { exact: true })
    .click();
  await expect(
    page.locator('details [data-skill="C5.1"]').last(),
  ).toHaveAttribute("data-level", "1");
});

test("guided tour has four stages and an explicitly human-graded online example", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Start the 3-minute demo", exact: true })
    .click();
  await expect(page.locator(".tour-steps button")).toHaveCount(4);
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: /^Next:/ }).click();
  await expect(
    page.getByText(
      "Online exercise · Graded by the recruiter · fictional example",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.locator(".tour-pair figure").last().locator('[data-skill="C5.1"]'),
  ).toHaveAttribute("data-level", "1");
  await expect(
    page
      .getByRole("navigation", { name: "Workspace navigation" })
      .getByRole("link"),
  ).toHaveCount(4);
});

for (const [width, height] of [
  [1440, 900],
  [390, 844],
]) {
  test(`visual matrix ${width}x${height}: approved names, reduced motion and no horizontal overflow`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height });
    for (const [name, route] of routes) {
      await page.goto(route);
      await page.locator("h1").waitFor();
      await expect(page.locator(".loading-state")).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        route,
      ).toBe(false);
      const text = await page.locator("main").innerText();
      for (const old of [
        "Listen and surface the real need",
        "Present and defend a proposal",
        "Deliver work that meets the requirements",
        "Frame a problem",
      ])
        expect(text).not.toContain(old);
      const moving = await page
        .locator(".rosace-branch, .background-beams path, .text-generate-word")
        .evaluateAll(
          (nodes) =>
            nodes.filter((n) => getComputedStyle(n).animationName !== "none")
              .length,
        );
      expect(moving).toBe(0);
      await page.screenshot({
        path: info.outputPath(`${name}-${width}x${height}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
    expect(errors).toEqual([]);
  });
}

test("Claude feedback is explicit and cannot grade a submitted exercise", async ({
  page,
}) => {
  await page.route("**/api/integrations", (route) =>
    route.fulfill({ json: { ai: true, provider: "Claude", context: false } }),
  );
  let calls = 0;
  await page.route("**/api/exercise-feedback", (route) => {
    calls++;
    expect(route.request().postDataJSON()).toMatchObject({
      consent: true,
      skill: "J.EMBEDDED_C",
      level: 3,
    });
    return route.fulfill({
      json: {
        strengths: [],
        questions: ["How would you test wraparound?"],
        limitations: "A human must review this fictional answer.",
      },
    });
  });
  await page.goto("/talent/checks");
  await page
    .getByRole("combobox", { name: "Exercise", exact: true })
    .selectOption("J.EMBEDDED_C");
  await page
    .getByLabel("Your exercise answer", { exact: true })
    .fill(
      "I would define a single-producer buffer and test wraparound before release.",
    );
  await page
    .getByRole("button", { name: "Submit for recruiter review", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Workspace role", exact: true })
    .selectOption("recruiter");
  await page.getByText("Optional Claude feedback", { exact: true }).click();
  const request = page.getByRole("button", {
    name: "Request AI feedback",
    exact: true,
  });
  await expect(request).toBeDisabled();
  expect(calls).toBe(0);
  await page
    .getByRole("checkbox", {
      name: "Send this fictional answer to Claude.",
      exact: true,
    })
    .check();
  await request.click();
  await expect(
    page.getByText("How would you test wraparound?", { exact: true }),
  ).toBeVisible();
  expect(calls).toBe(1);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("rosace.event-workspace.v1")!)
          .observations,
    ),
  ).toEqual([]);
  await expect(page.getByRole("status")).toHaveText("Done");
});

test("candidate and recruiter workspaces are separate and approved Claude exercises travel between them", async ({
  page,
}) => {
  await page.route("**/api/integrations", (route) =>
    route.fulfill({ json: { ai: true, provider: "Claude", context: false } }),
  );
  const prompt =
    "Fictional board restart: ask for the power log, state an assumption and propose one check.";
  await page.route("**/api/check-proposal", (route) =>
    route.fulfill({
      json: {
        skill: "C5.1",
        level: 1,
        minutes: 6,
        prompt,
        checks: [
          "States a fact",
          "Asks for missing information",
          "Proposes a check",
        ],
        sourceIds: ["job:1"],
        passages: [
          {
            id: "job:1",
            sourceId: "job",
            title: "Reviewed job",
            text: "Investigate a fictional sensor restart.",
          },
        ],
      },
    }),
  );
  await page.goto("/checks");
  await expect(
    page.getByLabel("Your exercise answer", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByText("Prepare an exercise with Claude", { exact: true })
    .click();
  await page
    .getByRole("checkbox", {
      name: "I reviewed this fictional job and company context for Claude.",
      exact: true,
    })
    .check();
  await page
    .getByRole("button", { name: "Propose an exercise", exact: true })
    .click();
  await expect(page.getByText(prompt, { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem("rosace.event-workspace.v1") ||
            '{"exercises":[]}',
        ).exercises,
    ),
  ).toEqual([]);
  await page
    .getByRole("button", { name: "Approve this exercise", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Workspace role", exact: true })
    .selectOption("candidate");
  await expect(page).toHaveURL(/\/talent\/checks/);
  await expect(page.getByText(prompt, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "A — Seen clearly", exact: true }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Workspace navigation" })
      .getByRole("link", { name: "Recruiter need", exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Your exercise answer", { exact: true })
    .fill("I would ask for the fictional power log and reproduce the reset.");
  await page
    .getByRole("button", { name: "Submit for recruiter review", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Workspace role", exact: true })
    .selectOption("recruiter");
  await expect(page).toHaveURL(/\/checks\?/);
  await expect(page.getByText(prompt, { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "A — Seen clearly", exact: true })
    .click();
  await expect(
    page.locator('[data-evidence="observed"][data-skill="C5.1"]').first(),
  ).toHaveAttribute("data-level", "1");
});

test("Claude requirements are cited suggestions until the recruiter accepts them", async ({
  page,
}) => {
  await page.route("**/api/integrations", (route) =>
    route.fulfill({ json: { ai: true, provider: "Claude", context: false } }),
  );
  await page.route("**/api/need-proposal", (route) =>
    route.fulfill({
      json: {
        requirements: ["C5.1", "C4.1", "C2.2"].map((skill) => ({
          skill,
          expected: 2,
          major: true,
          reason: "Investigate fictional hardware faults with the team.",
          sourceIds: ["job:1"],
        })),
        passages: [
          {
            id: "job:1",
            sourceId: "job",
            title: "Reviewed job",
            text: "Investigate fictional hardware faults with the team.",
          },
        ],
      },
    }),
  );
  await page.goto("/need/new");
  await page
    .getByRole("button", { name: "Try a fictional role", exact: false })
    .click();
  await page
    .getByRole("button", { name: "Continue to working context", exact: false })
    .click();
  await page
    .getByRole("checkbox", {
      name: "I have reviewed the job and company context.",
      exact: false,
    })
    .check();
  await page
    .getByRole("button", { name: "Explore the 12 components", exact: false })
    .click();
  await page
    .getByText("Suggest requirements with Claude", { exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Suggest components for this role",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Proposal · not applied", { exact: true }),
  ).toBeVisible();
  expect(
    await page.locator('.rosace-branch[data-evidence="expected"]').count(),
  ).toBe(0);
  await page
    .getByRole("button", { name: "Use these requirements", exact: true })
    .click();
  await expect(
    page.locator('.rosace-branch[data-evidence="expected"]'),
  ).toHaveCount(3);
});
