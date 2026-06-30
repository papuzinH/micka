import { test, expect } from "@playwright/test";

test("el Home renderiza las secciones clave en EN", async ({ page }) => {
  await page.goto("/en");
  await expect(
    page.getByRole("heading", { name: /Women's Cycling/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Starred albums" })
  ).toBeVisible();
  await expect(page.getByText("My faves of all time")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Brands\. Teams\. Athletes\./i })
  ).toBeVisible();
});

test("el toggle de idioma cambia el contenido a francés", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: /Switch language to FR/i }).click();
  await expect(page).toHaveURL(/\/fr$/);
  await expect(
    page.getByRole("heading", { name: /Cyclisme féminin/i })
  ).toBeVisible();
});
