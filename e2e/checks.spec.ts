import { test, expect } from "@playwright/test";

const workspaceKey = "rosace.event-workspace.v1";

test("the prefilled recording plays, pauses and finishes without saving decisions or calling AI", async ({
  page,
}) => {
  await page.clock.install();
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") posts.push(r.url());
  });
  await page.goto("/tour");
  await expect(
    page.getByRole("button", { name: "Play demo", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play demo", exact: true }).click();
  await page.clock.fastForward(12000);
  await expect(
    page.getByRole("button", { name: "Three priorities", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('.tour-scene [data-evidence="expected"]'),
  ).not.toHaveCount(0);
  await page.getByRole("button", { name: "Pause demo", exact: true }).click();
  const paused = await page.getByLabel("Playback time").textContent();
  await page.clock.fastForward(5000);
  await expect(page.getByLabel("Playback time")).toHaveText(paused!);
  await page.getByRole("button", { name: "Play demo", exact: true }).click();
  await page.clock.fastForward(170000);
  await expect(
    page.getByRole("button", { name: "Replay demo", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("At the meeting: Work with others", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.tour-pair [data-evidence="observed"][data-skill="C4.1"]'),
  ).toHaveAttribute("data-level", "1.2");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), workspaceKey),
  ).toBeNull();
  expect(posts).toEqual([]);
  await page
    .getByRole("button", { name: "AI recommendation", exact: true })
    .click();
  await expect(
    page.locator('.tour-pair [data-evidence="observed"]'),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Human validation", exact: true })
    .click();
  await expect(
    page.locator('.tour-pair [data-evidence="observed"][data-skill="C5.1"]'),
  ).toHaveAttribute("data-level", "1");
});

test("a timed attempt stops editing but waits for explicit submission and human grading", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/talent/checks");
  await expect(
    page.getByLabel("Your exercise answer", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Start exercise", exact: true })
    .click();
  const answer = page.getByRole("textbox", {
    name: "Your exercise answer",
    exact: true,
  });
  await expect(answer).toBeFocused();
  await answer.fill(
    "I would ask about the power log, separate facts and test the connection.",
  );
  await expect(page.getByLabel("Exercise", { exact: true })).toBeDisabled();
  await page.clock.fastForward(361000);
  await expect(answer).toHaveAttribute("readonly", "");
  await expect(page.getByRole("timer")).toHaveText("0:00");
  await expect(
    page.getByRole("alert").filter({ hasText: "Writing has stopped" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) || '{"checks":[]}').checks,
      workspaceKey,
    ),
  ).toEqual([]);
  await page
    .getByRole("button", { name: "Submit for recruiter review", exact: true })
    .click();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    workspaceKey,
  );
  expect(saved.checks[0].answer).toContain("power log");
  expect(saved.checks[0].timing.allowedSeconds).toBe(360);
  expect(saved.observations).toEqual([]);
  await page.getByRole("button", { name: /Demo profile$/ }).click();
  await page.getByRole("button", { name: /^Recruiter(?: Current)?$/ }).click();
  await expect(
    page.getByText(
      /Timing is contextual information, never an automatic grade/,
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "C — Seen in part", exact: true })
    .click();
  await expect(
    page.locator('[data-evidence="observed"][data-skill="C5.1"]').first(),
  ).toHaveAttribute("data-level", "0.6");
});

test("the recruiter selects a relevant 20-minute plan shared with the candidate", async ({
  page,
}) => {
  await page.goto("/checks");
  await page
    .getByText("Choose the exercises for this role", { exact: true })
    .click();
  const learn = page.getByRole("checkbox", { name: /Learn fast on your own/ });
  await learn.click();
  await expect(
    page.getByRole("alert").filter({ hasText: "20 minutes" }),
  ).toBeVisible();
  await expect(learn).not.toBeChecked();
  for (const name of [
    /Break down a problem/,
    /Get it right and spot the error/,
    /Program embedded systems in C/,
  ])
    await page.getByRole("checkbox", { name }).uncheck();
  await expect(page.getByText(/waiting for the talent’s answer/)).toHaveCount(
    0,
  );
  await expect(page.getByLabel("Exercise", { exact: true })).toBeDisabled();
  await learn.check();
  await expect(
    page.getByText("20 of 20 minutes selected for this role.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Demo profile$/ }).click();
  await page.getByRole("button", { name: /^Candidate(?: Current)?$/ }).click();
  await expect(page.getByLabel("Exercise", { exact: true })).toHaveValue(
    "C5.2",
  );
  await page
    .getByRole("button", { name: "Start exercise", exact: true })
    .click();
  await expect(page.getByRole("timer")).toHaveText(/^(20:00|19:5\d)$/);
  await expect(page.locator(".check-prompt")).toContainText(
    "fictional log query tool",
  );
  await page
    .getByRole("button", { name: "Discard this attempt", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "At the meeting", exact: true }),
  ).toBeVisible();
});

for (const width of [1440, 768, 390, 320]) {
  test(`demo moments and timed checks fit ${width}px`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/tour");
    for (let chapter = 0; chapter < 4; chapter++) {
      await page.locator(".tour-steps button").nth(chapter).click();
      for (let beat = 0; beat < 4; beat++) {
        await page
          .getByRole("navigation", { name: "Chapter moments" })
          .getByRole("button")
          .nth(beat)
          .click();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width + 1);
      }
    }
    await page.screenshot({
      path: info.outputPath(`demo-${width}.png`),
      fullPage: true,
    });
    await page.goto("/talent/checks");
    await page
      .getByRole("button", { name: "Start exercise", exact: true })
      .click();
    await page
      .getByLabel("Your exercise answer", { exact: true })
      .fill("A fictional answer for layout review.");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width + 1);
    await page.screenshot({
      path: info.outputPath(`timed-check-${width}.png`),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}
