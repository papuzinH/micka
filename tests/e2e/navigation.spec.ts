import { test, expect } from "@playwright/test";

test("el navbar expone los links de navegación localizados", async ({
  page,
}) => {
  await page.goto("/en");
  const portfolio = page.getByRole("link", { name: "Portfolio" }).first();
  await expect(portfolio).toBeVisible();
  await expect(portfolio).toHaveAttribute("href", /\/portfolio$/);
});

test("el menú mobile abre y cierra", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/en");

  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();

  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
});
