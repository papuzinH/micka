import { describe, it, expect, afterEach, vi } from "vitest";
import { pageAlternates } from "../alternates";

describe("pageAlternates", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("genera canonical del locale actual y languages en/fr + x-default", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    expect(pageAlternates("/portfolio", "fr")).toEqual({
      canonical: "https://example.com/fr/portfolio",
      languages: {
        en: "https://example.com/en/portfolio",
        fr: "https://example.com/fr/portfolio",
        "x-default": "https://example.com/en/portfolio",
      },
    });
  });

  it("maneja el Home (path vacío)", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    expect(pageAlternates("", "en")).toEqual({
      canonical: "https://example.com/en",
      languages: {
        en: "https://example.com/en",
        fr: "https://example.com/fr",
        "x-default": "https://example.com/en",
      },
    });
  });
});
