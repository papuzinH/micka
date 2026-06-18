import { test, expect } from "@playwright/test";

test("redirige a login si no hay sesión", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("muestra error con credenciales inválidas", async ({ page }) => {
  await page.goto("/admin/login");
  await page.fill('input[name="email"]', "wrong@test.com");
  await page.fill('input[name="password"]', "wrongpass");
  await page.click('button[type="submit"]');
  await expect(page.locator("text=Credenciales inválidas")).toBeVisible();
});
