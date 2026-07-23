import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n/routing";

const STATIC_PATHS = ["", "/portfolio", "/about", "/reviews", "/collabs", "/contact"];

type AlbumRef = { slug: string; updated?: string };

/** Entradas del sitemap: estáticas + álbumes, por locale, con hreflang. Pura y testeable. */
export function buildSitemapEntries(
  albums: AlbumRef[],
  siteUrl: string,
): MetadataRoute.Sitemap {
  const paths: Array<{ path: string; lastModified?: Date }> = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...albums.map((a) => ({
      path: `/portfolio/${a.slug}`,
      lastModified: a.updated ? new Date(a.updated) : undefined,
    })),
  ];
  return paths.flatMap(({ path, lastModified }) =>
    routing.locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      ...(lastModified ? { lastModified } : {}),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`]),
        ),
      },
    })),
  );
}
