import type { MetadataRoute } from "next";
import { getAlbums } from "@/lib/pocketbase/queries";
import { getSiteUrl } from "@/lib/seo/site";
import { buildSitemapEntries } from "@/lib/seo/sitemap-entries";

// Revalida el sitemap periódicamente (ISR) para que los álbumes nuevos entren
// sin esperar a un rebuild.
export const revalidate = 300;

// getAlbums() ya es resiliente (devuelve [] si PocketBase no responde):
// el sitemap siempre emite al menos las páginas estáticas.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const albums = await getAlbums();
  return buildSitemapEntries(albums, getSiteUrl());
}
