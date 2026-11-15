import { test, expect } from "@playwright/test";

const workspaceKey = "rosace.event-workspace.v1";

test("a consented talent card survives navigation, can be edited, and deletes cleanly", async ({
  page,
}) => {
  await page.goto("/talent/new");
  await expect(
    page.getByRole("link", { name: "Organiser demo data" }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Paste CV text or describe an experience" })
    .fill("I tested fictional sensors with a team. TRANSIENT-CV-ONLY");
  await page.getByRole("button", { name: "Explore my skills" }).click();
  await page.getByLabel("Yes, in a real task", { exact: true }).check();
  await page.getByLabel("On my own", { exact: true }).check();
  await page.getByLabel("Simple or well-defined work", { exact: true }).check();
  await page.getByRole("button", { name: "Confirm this level" }).click();
  await page.getByRole("button", { name: "Review my card (1)" }).click();
  await page.getByLabel("Fictional display name").fill("Taylor demo");
  await page.getByRole("checkbox", { name: "Keep my confirmed card" }).check();
  await page
    .getByRole("button", { name: "Save my confirmed card", exact: true })
    .click();
  await page.goto("/candidate");
  await expect(
    page.getByRole("heading", { name: "Your confirmed declarations" }),
  ).toBeVisible();
  await expect(
    page.locator('.rosace-branch[data-skill="C1.1"][data-evidence="declared"]'),
  ).toHaveAttribute("data-level", "2");
  await expect(
    page.locator('.rosace-branch[data-evidence="observed"]'),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Continue my skills card" }).click();
  await page.waitForURL("**/talent/new");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your saved skills card." }),
  ).toBeVisible();
  await expect(page.getByLabel("Fictional display name")).toHaveValue(
    "Taylor demo",
  );
  await expect(
    page.locator('.rosace-branch[data-skill="C1.1"]'),
  ).toHaveAttribute("data-level", "2");
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "TRANSIENT-CV-ONLY",
  );
  await page.getByRole("button", { name: "Edit my card", exact: true }).click();
  await expect(page.getByRole("radio", { name: /Intermediate/ })).toBeChecked();
  await page.getByRole("radio", { name: /Foundation/ }).check();
  await page.getByRole("button", { name: "Confirm this level" }).click();
  await page.getByRole("button", { name: "3 Your card", exact: true }).click();
  await page
    .getByRole("button", { name: "Save my confirmed card", exact: true })
    .click();
  await page.reload();
  await expect(
    page.locator('.rosace-branch[data-skill="C1.1"]'),
  ).toHaveAttribute("data-level", "1");
  await page
    .getByRole("button", { name: "Delete my card and clear this session" })
    .click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Build your skills card." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).talents,
      workspaceKey,
    ),
  ).toEqual([]);
});

test("expired talent declarations are not restored", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          needs: [],
          journal: [],
          observations: [],
          talents: [
            {
              expiresAt: 1,
              talent: {
                id: "local-talent",
                pseudonym: "Expired",
                cv: "",
                statements: { "C1.1": { level: 2, evidence: "declared" } },
              },
            },
          ],
        }),
      ),
    workspaceKey,
  );
  await page.goto("/talent/new");
  await expect(
    page.getByRole("heading", { name: "Build your skills card." }),
  ).toBeVisible();
  await expect(page.locator(".rosace-branch")).toHaveCount(0);
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).talents,
      workspaceKey,
    ),
  ).toEqual([]);
});

test("a preview never becomes a requirement without an explicit priority", async ({
  page,
}) => {
  await page.goto("/need/new");
  await page.getByRole("button", { name: "Try a fictional role" }).click();
  await page
    .getByRole("button", { name: "2 12 components", exact: true })
    .click();
  await page.getByRole("radio", { name: "Intermediate", exact: true }).check();
  await expect(page.locator(".rosace-preview")).toHaveCount(1);
  await expect(page.locator('.rosace-branch[data-skill="C1.1"]')).toHaveCount(
    0,
  );
  await expect(
    page.getByText(
      "Preview only · Choose Major or Minor to include this level",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Major · gold", exact: true }).click();
  await expect(page.locator(".rosace-preview")).toHaveCount(0);
  await expect(
    page.locator('.rosace-branch[data-skill="C1.1"]'),
  ).toHaveAttribute("data-level", "2");
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Next component" }).click();
    await page
      .getByRole("button", { name: "Major · gold", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Review my need" }).click();
  await page.getByRole("button", { name: "Confirm and save need" }).click();
  await expect(
    page.getByText("Need confirmed and saved", { exact: true }),
  ).toBeVisible();
});

test("decision errors stay with the reason and observations announce their saved state", async ({
  page,
}) => {
  await page.goto("/organiser");
  const card = page
    .locator(".organiser-grid > section:not([hidden]) .meeting-card")
    .filter({ hasText: "Amira" });
  await card.locator("summary").click();
  await card
    .getByRole("button", { name: "Approve / add", exact: true })
    .click();
  await expect(card.getByRole("alert")).toHaveText("Add a one-line reason.");
  await expect(card.getByRole("textbox")).toBeFocused();
  await card.getByRole("textbox").fill("Discuss the fictional prototype.");
  await card
    .getByRole("button", { name: "Approve / add", exact: true })
    .click();
  await expect(card.getByRole("status")).toContainText("Approved");
  await card.getByRole("link", { name: "Prepare conversation" }).click();
  await page.getByRole("button", { name: "Record observations" }).click();
  await page.locator(".observation-row select").first().selectOption("C");
  await expect(page.locator(".observation-status")).toContainText(
    "Observation saved",
  );
  await page
    .getByText("Compare with the original declaration", { exact: true })
    .click();
  await expect(
    page
      .locator("figure")
      .filter({ hasText: "Original declaration · unchanged" })
      .locator('.rosace-branch[data-skill="C5.1"]'),
  ).toHaveAttribute("data-level", "1");
  await page.reload();
  await page.getByRole("button", { name: "Record observations" }).click();
  await expect(page.locator(".observation-row select").first()).toHaveValue(
    "C",
  );
});

test("mobile roles and rosace stay usable on a phone with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/need/new",
    "/talent/new",
    "/organiser",
    "/conversations",
    "/brief?need=nordchip-embedded&talent=amira",
    "/practice",
  ]) {
    await page.goto(route);
    await page.locator("h1").waitFor();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      route,
    ).toBe(false);
    const backgrounds = await page
      .locator(".form-panel, .live-panel, .demo-surface, .level-card")
      .evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).backgroundColor),
      );
    expect(backgrounds).not.toContain("rgb(255, 255, 255)");
  }
  await page
    .getByRole("combobox", { name: "Workspace page" })
    .selectOption("/need/new");
  await page.getByRole("button", { name: "Try a fictional role" }).click();
  await page
    .getByRole("button", { name: "2 12 components", exact: true })
    .click();
  const preview = page.getByRole("button", { name: /Your rosace/ });
  await expect(preview).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("radio", { name: "Intermediate", exact: true }).check();
  await page.getByRole("button", { name: "Major · gold", exact: true }).click();
  await expect(preview).toContainText("1 of 3 majors");
  expect(
    await page
      .locator(".level-card")
      .evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).backgroundColor),
      ),
  ).not.toContain("rgb(255, 255, 255)");
  expect(
    await page
      .locator("body")
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe("rgb(230, 231, 236)");

  await expect(preview).toBeInViewport();
  await preview.click();
  await expect(
    page.getByRole("button", {
      name: "Explore Reach out to people",
      exact: true,
    }),
  ).toBeVisible();
  await preview.click();
  expect(
    await page
      .locator(".aurora-layer")
      .evaluate(
        (element) => getComputedStyle(element, "::after").animationName,
      ),
  ).toBe("none");
});

test("an unreadable PDF offers a recovery action without replacing the current text", async ({
  page,
}) => {
  await page.goto("/talent/new");
  const text = page.getByRole("textbox", {
    name: "Paste CV text or describe an experience",
  });
  await text.fill("A fictional experience already entered.");
  await page
    .getByLabel("Import a synthetic CV", { exact: true })
    .setInputFiles({
      name: "unreadable.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("not a PDF"),
    });
  await expect(page.locator(".document-input [role=status]")).toHaveText(
    "This PDF could not be read. Try another document or paste its text instead.",
  );
  await expect(text).toHaveValue("A fictional experience already entered.");
});
