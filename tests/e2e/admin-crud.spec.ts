import { test, expect } from "@playwright/test";

const EMAIL = process.env.POCKETBASE_ADMIN_EMAIL ?? "";
const PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD ?? "";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin$/, { timeout: 30000 });
}

test("admin: el dashboard muestra las colecciones tras login", async ({
  page,
}) => {
  await login(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Albums", exact: true }),
  ).toBeVisible();
});

test("admin: la lista de álbumes carga y el form de edición trae datos", async ({
  page,
}) => {
  await login(page);
  await page.goto("/admin/albums");
  await expect(page.getByRole("heading", { name: "Albums" })).toBeVisible();

  await page.getByRole("link", { name: "Edit" }).first().click();
  await expect(page.getByRole("heading", { name: "Edit Album" })).toBeVisible();
  await expect(page.locator('input[name="title_en"]')).toHaveValue(/.+/);
});

test("contacto: enviar el formulario persiste el mensaje en la bandeja", async ({
  page,
}) => {
  const tag = `E2E ${Date.now()}`;

  await page.goto("/en/contact");
  await page.fill('input[name="name"]', tag);
  await page.fill('input[name="email"]', "e2e@example.com");
  await page.fill('textarea[name="message"]', "Automated test message.");
  await page.click('button[type="submit"]');
  await expect(page.getByText(/your message has been sent/i)).toBeVisible();

  // aparece en la bandeja del admin
  await login(page);
  await page.goto("/admin/messages");
  await expect(page.getByText(tag)).toBeVisible();

  // cleanup: borrar el mensaje de prueba
  page.on("dialog", (d) => d.accept());
  const row = page.getByRole("row").filter({ hasText: tag });
  await row.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(tag)).toBeHidden();
});
