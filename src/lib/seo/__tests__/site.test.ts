import { describe, it, expect, afterEach, vi } from "vitest";
import { getSiteUrl } from "../site";

describe("getSiteUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("devuelve el fallback de Vercel si NEXT_PUBLIC_SITE_URL no está seteada", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getSiteUrl()).toBe("https://micka-plum.vercel.app");
  });

  it("devuelve la env var cuando está seteada", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://donmickadelavega.com");
    expect(getSiteUrl()).toBe("https://donmickadelavega.com");
  });

  it("normaliza el trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://donmickadelavega.com/");
    expect(getSiteUrl()).toBe("https://donmickadelavega.com");
  });
});
