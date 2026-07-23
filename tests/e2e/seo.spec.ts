import { test, expect } from "@playwright/test";

test.describe("SEO técnico", () => {
  test("sitemap.xml responde y contiene rutas de ambos locales", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("/en/portfolio");
    expect(body).toContain("/fr/portfolio");
    expect(body).toContain("<xhtml:link");
  });

  test("robots.txt permite el sitio y bloquea /admin", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Sitemap:");
  });

  test("el Home declara canonical y hreflang", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/en$/,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="fr"]'),
    ).toHaveAttribute("href", /\/fr$/);
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]'),
    ).toHaveCount(1);
  });

  test("una subpágina declara hreflang del otro locale", async ({ page }) => {
    await page.goto("/fr/portfolio");
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", /\/en\/portfolio$/);
  });

  test("el Home expone JSON-LD Person", async ({ page }) => {
    await page.goto("/en");
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(jsonLd).toContain('"Person"');
    expect(jsonLd).toContain("Don Micka de la Vega");
  });
});
