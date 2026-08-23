import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");
}

test.describe("insights page", () => {
  test("insights page renders with student selector", async ({ page }) => {
    await login(page);
    await page.goto("/insights");

    await expect(page.locator("h1")).toContainText("Insights");
    await expect(page.locator("select")).toBeVisible();
  });

  test("selecting a student loads status", async ({ page }) => {
    await login(page);
    await page.goto("/insights");

    const select = page.locator("select");
    await expect(select).toBeVisible();

    const optionCount = await select.locator("option").count();
    if (optionCount > 1) {
      await select.selectOption({ index: 1 });
      await page.waitForResponse(
        (res) => res.url().includes("/api/insights") && res.status() === 200
      );
      const content = await page.locator(".rounded-lg.border").textContent();
      expect(content).toBeTruthy();
    }
  });

  test("dashboard insights card links correctly", async ({ page }) => {
    await login(page);
    await page.goto("/");

    await page.getByRole("heading", { name: "Insights" }).click();
    await expect(page).toHaveURL("/insights");
  });
});
