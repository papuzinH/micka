import { test, expect } from "@playwright/test";

test("portfolio lista álbumes del CMS y navega al detalle", async ({ page }) => {
  await page.goto("/en/portfolio");
  await expect(
    page.getByRole("heading", { level: 1, name: "Portfolio" }),
  ).toBeVisible();

  const album = page.getByRole("link", { name: /start of the race/i });
  await expect(album).toBeVisible();
  await album.click();

  await expect(page).toHaveURL(/\/portfolio\/start-of-the-race$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /start of the race/i,
  );
});

test("about, reviews, collabs y contact renderizan su encabezado", async ({
  page,
}) => {
  await page.goto("/en/about");
  await expect(
    page.getByRole("heading", { level: 1, name: "About Me" }),
  ).toBeVisible();

  await page.goto("/en/reviews");
  await expect(
    page.getByRole("heading", { level: 1, name: "Reviews" }),
  ).toBeVisible();

  await page.goto("/en/collabs");
  await expect(
    page.getByRole("heading", { level: 1, name: "Collabs" }),
  ).toBeVisible();

  await page.goto("/en/contact");
  await expect(
    page.getByRole("heading", { level: 1, name: "Contact" }),
  ).toBeVisible();
  await expect(page.getByPlaceholder("Your name")).toBeVisible();
});

test("404 localizado para un álbum inexistente", async ({ page }) => {
  await page.goto("/en/portfolio/does-not-exist");
  await expect(page.getByText("404")).toBeVisible();
  await expect(page.getByText("Page not found")).toBeVisible();
});
