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

test("login exitoso lleva al dashboard y permanece en /admin", async ({ page }) => {
  test.skip(
    !process.env.POCKETBASE_ADMIN_EMAIL || !process.env.POCKETBASE_ADMIN_PASSWORD,
    "Requiere POCKETBASE_ADMIN_EMAIL y POCKETBASE_ADMIN_PASSWORD en .env.local",
  );
  await page.goto("/admin/login");
  await page.fill('input[name="email"]', process.env.POCKETBASE_ADMIN_EMAIL!);
  await page.fill('input[name="password"]', process.env.POCKETBASE_ADMIN_PASSWORD!);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin$/, { timeout: 10000 });
  await expect(page.getByRole("heading", { name: "Panel Micka" })).toBeVisible();
});
