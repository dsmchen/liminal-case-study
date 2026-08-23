import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/");
}

test.describe("entry form", () => {
  test("entry form renders with all fields", async ({ page }) => {
    await login(page);
    await page.goto("/entries/new");

    await expect(page.locator("h1")).toContainText("New ABC Entry");
    await expect(page.locator("select")).toBeVisible();
    await expect(page.getByText("Antecedent *")).toBeVisible();
    await expect(page.getByText("Behavior *")).toBeVisible();
    await expect(page.getByText("Consequence *")).toBeVisible();
    await expect(page.getByText("Location *")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Entry" })).toBeVisible();
  });

  test("submitting empty form shows error", async ({ page }) => {
    await login(page);
    await page.goto("/entries/new");

    await page.getByRole("button", { name: "Save Entry" }).click();
    await expect(page.locator(".bg-red-50")).toBeVisible();
  });

  test("can select checkboxes and submit entry", async ({ page }) => {
    await login(page);
    await page.goto("/entries/new");

    // Select a student (need at least one in the DB)
    const studentSelect = page.locator("select");
    const options = await studentSelect.locator("option").allTextContents();
    if (options.length > 1) {
      await studentSelect.selectOption({ index: 1 });

      // Select antecedent
      await page.click('text=Demand placed');

      // Select behavior
      await page.click('text=Hitting');

      // Select consequence
      await page.click('text=Verbal redirection');

      // Select location
      await page.click('text=Classroom');

      // Submit
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/entries");
    }
  });

  test("entry history page renders", async ({ page }) => {
    await login(page);
    await page.goto("/entries");

    await expect(page.locator("h1")).toContainText("Entry History");
    await expect(page.locator("text=New Entry")).toBeVisible();
  });

  test("new entry link works from entry history", async ({ page }) => {
    await login(page);
    await page.goto("/entries");

    await page.getByRole("link", { name: "New Entry" }).first().click();
    await expect(page).toHaveURL("/entries/new");
  });
});
