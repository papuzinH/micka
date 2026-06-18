import { test, expect } from "@playwright/test";

test("redirige la raíz a /en por defecto", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("main")).toContainText("Micka's Photos");
});

test("sirve la versión francesa en /fr", async ({ page }) => {
  await page.goto("/fr");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});
