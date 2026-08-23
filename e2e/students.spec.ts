import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");
}

test.describe("student detail page", () => {
  test("renders student info from list", async ({ page }) => {
    await login(page);
    await page.goto("/students");

    const viewLink = page.getByRole("link", { name: "View" }).first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByText("Status:")).toBeVisible();
      await expect(page.getByText("Entries:")).toBeVisible();
    }
  });

  test("has Log Entry and Insights links", async ({ page }) => {
    await login(page);
    await page.goto("/students");

    const viewLink = page.getByRole("link", { name: "View" }).first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      await expect(page.getByRole("link", { name: "Log Entry" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Insights" })).toBeVisible();
    }
  });

  test("shows entry history section", async ({ page }) => {
    await login(page);
    await page.goto("/students");

    const viewLink = page.getByRole("link", { name: "View" }).first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      await expect(page.getByRole("heading", { name: "Entry History" })).toBeVisible();
    }
  });

  test("nonexistent student shows 404", async ({ page }) => {
    await login(page);
    await page.goto("/students/00000000-0000-0000-0000-000000000000");
    await expect(page.locator("h1")).toContainText("404");
  });
});
