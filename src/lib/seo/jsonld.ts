/** Builders puros de JSON-LD. Sin datos dinámicos: nunca rompen el render. */
export function personJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Don Micka de la Vega",
    jobTitle: "Sports Photographer",
    url: siteUrl,
    knowsAbout: ["Sports photography", "Women's cycling"],
  };
}

export function websiteJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Don Micka de la Vega",
    url: siteUrl,
    inLanguage: ["en", "fr"],
  };
}
