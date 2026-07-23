import { describe, it, expect } from "vitest";
import { buildSitemapEntries } from "../sitemap-entries";

const SITE = "https://example.com";

describe("buildSitemapEntries", () => {
  it("incluye las 6 páginas estáticas por locale con alternates hreflang", () => {
    const entries = buildSitemapEntries([], SITE);
    const urls = entries.map((e) => e.url);
    // 6 páginas (home + 5 subpáginas) × 2 locales
    expect(entries).toHaveLength(12);
    expect(urls).toContain("https://example.com/en");
    expect(urls).toContain("https://example.com/fr/portfolio");
    const home = entries.find((e) => e.url === "https://example.com/en");
    expect(home?.alternates?.languages).toEqual({
      en: "https://example.com/en",
      fr: "https://example.com/fr",
    });
  });

  it("agrega los álbumes por locale con lastModified", () => {
    const entries = buildSitemapEntries(
      [{ slug: "tour-2026", updated: "2026-07-01 10:00:00.000Z" }],
      SITE,
    );
    expect(entries).toHaveLength(14);
    const album = entries.find(
      (e) => e.url === "https://example.com/en/portfolio/tour-2026",
    );
    expect(album?.lastModified).toBeInstanceOf(Date);
  });
});
