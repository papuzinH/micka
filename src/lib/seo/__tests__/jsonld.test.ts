import { describe, it, expect } from "vitest";
import { personJsonLd, websiteJsonLd } from "../jsonld";

describe("jsonld", () => {
  it("Person con el branding correcto", () => {
    const p = personJsonLd("https://example.com");
    expect(p).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Don Micka de la Vega",
      url: "https://example.com",
    });
  });

  it("WebSite con ambos idiomas", () => {
    const w = websiteJsonLd("https://example.com");
    expect(w).toMatchObject({
      "@type": "WebSite",
      name: "Don Micka de la Vega",
      inLanguage: ["en", "fr"],
    });
  });
});
