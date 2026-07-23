import { describe, it, expect, afterEach, vi } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("permite todo salvo /admin y referencia el sitemap absoluto", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/admin" },
      sitemap: "https://example.com/sitemap.xml",
    });
  });
});
