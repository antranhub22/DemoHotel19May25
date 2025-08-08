import { expect, test } from "@playwright/test";

test("homepage renders main interface with service grid (layout stable)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("hasVisited", "true");
      localStorage.setItem("selectedLanguage", "en");
    } catch {}
  });

  await page.goto("/");
  // If welcome modal shows, close it
  const closeButtons = page.getByRole("button", { name: /Đóng|Close/i });
  if (
    await closeButtons
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await closeButtons.first().click();
  }

  // If language selection is required, open switcher and pick English
  const switcher = page.locator(
    '.voice-language-switcher, [aria-haspopup="listbox"]',
  );
  if (
    await switcher
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await switcher.first().click();
    // pick English by text or flag label
    const englishOption = page
      .getByRole("option", { name: /English/i })
      .first();
    if (await englishOption.isVisible().catch(() => false)) {
      await englishOption.click();
    } else {
      // fallback: click first option
      const firstOption = page.getByRole("option").first();
      if (await firstOption.isVisible().catch(() => false)) {
        await firstOption.click();
      }
    }
  }
  await page.waitForLoadState("domcontentloaded");

  // Wait for Interface1 container to be attached to the DOM
  // Fallback: wait for header to appear first
  await page
    .waitForSelector('div:has-text("Hotel Assistant")', { timeout: 45000 })
    .catch(() => {});
  await page.waitForSelector('[data-testid="interface1-container"]', {
    state: "attached",
    timeout: 45000,
  });
  const container = page.getByTestId("interface1-container");
  await expect(container).toBeVisible();

  // Wait for service grid
  await page.waitForSelector('[data-testid="service-grid"]', {
    state: "attached",
    timeout: 45000,
  });
  const grid = page.getByTestId("service-grid");
  await expect(grid).toBeVisible();
});
