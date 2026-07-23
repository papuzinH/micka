import type { Metadata } from "next";
import { routing } from "@/lib/i18n/routing";
import { getSiteUrl } from "./site";

/**
 * Canonical + hreflang para una ruta del sitio público.
 * `path` va SIN prefijo de locale ("" para el Home, "/portfolio", etc.).
 * x-default apunta al defaultLocale (en).
 */
export function pageAlternates(path: string, locale: string): Metadata["alternates"] {
  const site = getSiteUrl();
  const url = (l: string) => `${site}/${l}${path}`;
  const languages = Object.fromEntries(routing.locales.map((l) => [l, url(l)]));
  return {
    canonical: url(locale),
    languages: { ...languages, "x-default": url(routing.defaultLocale) },
  };
}
