import { test, expect, type Locator } from "@playwright/test";

async function expectUnobscured(control: Locator) {
  await control.scrollIntoViewIfNeeded();
  await control.focus();
  await expect(control).toBeFocused();
  expect(
    await control.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const hit = document.elementFromPoint(
        box.x + box.width / 2,
        box.y + box.height / 2,
      );
      return hit === element || element.contains(hit);
    }),
  ).toBe(true);
}

test("mobile intake fields remain visible and clickable when focused", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/need/new");
  await expectUnobscured(
    page.getByRole("textbox", { name: "Event", exact: true }),
  );
  await expectUnobscured(
    page.getByRole("textbox", { name: "Company name", exact: true }),
  );
  await page.goto("/talent/new");
  await expectUnobscured(
    page.getByRole("textbox", {
      name: "Paste CV text or describe an experience",
      exact: true,
    }),
  );
});

test("all technical level choices stay inside their panel at working widths", async ({
  page,
}) => {
  await page.goto("/need/new");
  await page.getByRole("button", { name: "Try a fictional role" }).click();
  await page.getByRole("button", { name: "3 Job skills", exact: true }).click();
  await page
    .getByRole("checkbox", {
      name: "Program embedded systems in C",
      exact: true,
    })
    .check();
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const cards = page.locator(".job-skill-block .level-card");
    await expect(cards).toHaveCount(3);
    expect(
      await cards.evaluateAll((elements) =>
        elements.every((element) => {
          const card = element.getBoundingClientRect();
          const panel = element.closest(".form-panel")!.getBoundingClientRect();
          return (
            card.left >= panel.left &&
            card.right <= panel.right &&
            element.scrollWidth <= element.clientWidth + 1
          );
        }),
      ),
      `level containment at ${width}px`,
    ).toBe(true);
    await page.getByRole("radio", { name: "Advanced", exact: true }).check();
    await expect(
      page.getByRole("radio", { name: "Advanced", exact: true }),
    ).toBeChecked();
  }
});

test("accessible counters and narrow review metadata retain their content", async ({
  page,
}) => {
  await page.goto("/");
  const snapshot = await page.locator(".hero-facts").ariaSnapshot();
  expect(snapshot).toContain('term: "12"');
  expect(snapshot).toContain('term: "3"');
  // The visible animation is hidden from assistive technology; the heading has one accessible name.
  await expect(
    page.getByRole("heading", {
      name: "Prepare your recruitment event.",
      exact: true,
    }),
  ).toBeVisible();
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/brief?need=nordchip-embedded&talent=amira");
    if (width <= 1000)
      await page.getByRole("button", { name: /Your rosace/ }).click();
    const bars = page.locator(".skill-bars");
    await expect(bars).toBeVisible();
    expect(
      await bars.evaluate(
        (element) => element.scrollWidth <= element.clientWidth + 1,
      ),
    ).toBe(true);
    const svg = page
      .locator(".preview-content .rosace-figure:visible svg")
      .first();
    expect(
      await svg.evaluate((element) => {
        const bounds = (element as SVGSVGElement).viewBox.baseVal;
        return [...element.querySelectorAll("text")].every((label) => {
          const box = label.getBBox();
          return (
            box.x >= bounds.x && box.x + box.width <= bounds.x + bounds.width
          );
        });
      }),
      `chart labels fit at ${width}px`,
    ).toBe(true);
    await page
      .getByRole("button", { name: "02 · Record observations", exact: true })
      .click();
    const row = page.locator(".observation-row").first();
    expect(
      await row.evaluate((element) => {
        const name = element.querySelector("strong")!.getBoundingClientRect();
        const method = element
          .querySelector("span small")!
          .getBoundingClientRect();
        return method.top >= name.bottom;
      }),
    ).toBe(true);
  }
});
