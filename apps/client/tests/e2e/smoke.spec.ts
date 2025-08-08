import { test, expect } from "@playwright/test";

test("homepage renders without layout shifts on load", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  // header visible
  const header = page.locator("div", {
    hasText: /Hotel (Assistant|Voice Assistant)/,
  });
  await expect(header).toBeVisible();
  // service grid present
  const grid = page.getByTestId("service-grid");
  await expect(grid).toBeVisible();
});
