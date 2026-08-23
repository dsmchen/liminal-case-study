import { test, expect } from "@playwright/test";

test.describe("auth flows", () => {
  test("redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Behavior Tracker");
    await expect(page.locator("text=Sign in to your staff account")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText("Sign in");
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid login credentials")).toBeVisible();
  });

  test("login with valid credentials redirects to /", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1")).toContainText("Welcome");
  });

  test("authenticated user on /login redirects to /", async ({ page }) => {
    // First login
    await page.goto("/login");
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");

    // Then try to visit /login again
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test("signout redirects to /login", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");

    // Sign out
    await page.click("text=Sign out");
    await expect(page).toHaveURL(/\/login/);
  });

  test("dashboard shows navigation cards when logged in", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");

    // Check navigation cards
    await expect(page.getByRole("heading", { name: "Students" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "New Entry" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Entry History" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Insights" })).toBeVisible();
  });
});
