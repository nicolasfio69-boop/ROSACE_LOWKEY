import { test, expect } from "@playwright/test";
import assert from "node:assert/strict";
test("recruiter, document import, consented talent and observed conversation", async ({
  page,
}, testInfo) => {
  page.setDefaultTimeout(20000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const requests: { url: string; data: string | null }[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST")
      requests.push({ url: r.url(), data: r.postData() });
  });
  await page.goto("/need/new");
  console.log("Recruiter loaded");
  await page.getByLabel("Company name", { exact: true }).fill("NordChip demo");
  await page
    .getByLabel("Import a job description", { exact: true })
    .setInputFiles("e2e/fixtures/job.pdf");
  console.log("Import submitted");
  await page
    .getByText("Text extracted. Review it below before continuing.", {
      exact: true,
    })
    .waitFor();
  assert.match(
    await page
      .getByRole("textbox", { name: "Job description", exact: true })
      .inputValue(),
    /sensor firmware/,
  );
  await page
    .getByLabel("Job title", { exact: true })
    .fill("Junior embedded developer");
  await page
    .getByRole("combobox", { name: "Working arrangement", exact: true })
    .selectOption("Remote");
  await page
    .getByRole("textbox", { name: "What is one typical task?", exact: true })
    .fill("Test sensor firmware and report defects");
  await page
    .getByRole("checkbox", {
      name: "I have reviewed the job and company context.",
      exact: false,
    })
    .check();
  await page.screenshot({
    path: testInfo.outputPath("recruiter-context.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Explore the 12 components" }).click();
  assert.equal(await page.locator(".journey-rail button").count(), 12);
  await page.getByRole("radio", { name: "Intermediate", exact: true }).check();
  await page.getByRole("button", { name: "Major · gold", exact: true }).click();
  await page
    .getByRole("button", { name: "Next component", exact: false })
    .click();
  await page.getByRole("button", { name: "Major · gold", exact: true }).click();
  await page
    .getByRole("button", { name: "Next component", exact: false })
    .click();
  await page.getByRole("button", { name: "Major · gold", exact: true }).click();
  await page
    .getByRole("button", { name: "Next component", exact: false })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Major · gold", exact: true })
      .isDisabled(),
    true,
  );
  await page.getByRole("radio", { name: "Intermediate", exact: true }).check();
  await page.getByRole("button", { name: "Minor · red", exact: true }).click();
  await page.screenshot({
    path: testInfo.outputPath("recruiter-component.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "4 Review", exact: true }).click();
  await page.getByRole("button", { name: "Confirm and save need" }).click();
  await page.getByText("Need confirmed and saved", { exact: true }).waitFor();
  await page.reload();
  await page.getByText("Need confirmed and saved", { exact: true }).waitFor();
  await page.goto("/talent/new");
  await page
    .getByLabel("Import a synthetic CV", { exact: true })
    .setInputFiles("e2e/fixtures/cv.docx");
  console.log("Import submitted");
  await page
    .getByText("Text extracted. Review it below before continuing.", {
      exact: true,
    })
    .waitFor();
  assert.match(
    await page
      .getByRole("textbox", {
        name: "Paste CV text or describe an experience",
        exact: true,
      })
      .inputValue(),
    /synthetic sensors/,
  );
  await page.getByRole("button", { name: "Explore my skills" }).click();
  await page.getByLabel("Yes, in a real task", { exact: true }).check();
  await page.getByLabel("On my own", { exact: true }).check();
  await page.getByLabel("Simple or well-defined work", { exact: true }).check();
  await page.getByRole("button", { name: "Confirm this level" }).click();
  await page.getByLabel("Yes, in a real task", { exact: true }).check();
  await page.getByLabel("With help or guidance", { exact: true }).check();
  await page.getByLabel("Simple or well-defined work", { exact: true }).check();
  await page.getByRole("button", { name: "Confirm this level" }).click();
  await page.screenshot({
    path: testInfo.outputPath("talent-journey.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "3 Your card", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Keep my confirmed card", exact: false })
    .check();
  await page
    .getByRole("button", { name: "Save my confirmed card", exact: true })
    .click();
  await page
    .getByText("Card saved in this browser.", { exact: false })
    .waitFor();
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  assert(!stored.includes("I tested synthetic sensors"));
  assert(!stored.includes("I used Python"));
  assert(!requests.some((r) => r.data?.includes("I tested synthetic sensors")));
  await page.screenshot({
    path: testInfo.outputPath("talent-card.png"),
    fullPage: true,
  });
  await page.goto("/organiser");
  const section = page
    .locator(".organiser-grid>section")
    .filter({ has: page.getByText("NordChip demo", { exact: true }) });
  await section.waitFor();
  const card = section
    .locator(".meeting-card")
    .filter({ has: page.getByText("Demo talent", { exact: true }) });
  await card
    .getByLabel("Reason for Demo talent", { exact: true })
    .fill("Explore the declared experience during a conversation.");
  await card
    .getByRole("button", { name: "Approve / add", exact: true })
    .click();
  await card.getByText("Approved ·", { exact: false }).waitFor();
  await card.getByRole("link", { name: "Prepare conversation" }).click();
  await page
    .getByRole("heading", { name: "Demo talent × NordChip demo", exact: true })
    .waitFor();
  await page.locator(".observation-row select").first().selectOption("C");
  await page.reload();
  await page.locator(".observation-row select").first().waitFor();
  assert.equal(
    await page.locator(".observation-row select").first().inputValue(),
    "C",
  );
  await page.screenshot({
    path: testInfo.outputPath("brief.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/", "/need/new", "/talent/new", "/organiser"]) {
    await page.goto("" + route);
    await page.locator("h1").waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      route + " overflow",
    );
  }
  await page.goto("/need/new");
  await page
    .getByRole("button", { name: "2 12 components", exact: true })
    .click();
  await page.screenshot({
    path: testInfo.outputPath("mobile.png"),
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: real PDF + DOCX parsing, 12-step recruiter flow, limits, restore, talent questions and consent, no CV in storage/POST, organiser decision, saved observation, mobile routes, no client errors.",
  );
});
test("practice keeps answers in memory and requires consent for a provider call", async ({
  page,
}) => {
  await page.goto("/practice");
  await page
    .getByRole("textbox", { name: "Your practice answer", exact: true })
    .fill("A fictional answer about clarifying needs.");
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "A fictional answer",
  );
  await expect(
    page.getByRole("button", { name: "Request Gemini feedback" }),
  ).toBeDisabled();
  await page
    .getByRole("combobox", { name: "Component to practise" })
    .selectOption("C2.2");
  await expect(
    page.getByRole("textbox", { name: "Your practice answer", exact: true }),
  ).toHaveValue("");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});
