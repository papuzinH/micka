import { fileUrl } from "./files";
import type { SiteImages } from "./types";
import type { ThumbSize } from "@/lib/thumb-sizes";

/** Un slot de imagen del sitio: el campo en `site_images`, el thumb que pide
 *  el componente que la muestra y el placeholder que se usa mientras el
 *  cliente no haya subido la suya. */
export interface SiteImageSlot {
  field: keyof Omit<SiteImages, "id">;
  thumb: ThumbSize;
  fallback: string;
}

/** Los fallbacks replican exactamente lo que el sitio muestra hoy: mientras
 *  `site_images` esté vacía, la Home y el About no cambian ni un pixel. */
export const SITE_IMAGE_SLOTS = {
  homeHero: { field: "home_hero", thumb: "1920x0", fallback: "/placeholders/cyclist-road.jpg" },
  homePortrait: { field: "home_portrait", thumb: "400x0", fallback: "/placeholders/cyclist-portrait.jpg" },
  homeStrip1: { field: "home_strip_1", thumb: "800x0", fallback: "/placeholders/cyclist-duo.jpg" },
  homeStrip2: { field: "home_strip_2", thumb: "800x0", fallback: "/placeholders/cyclist-road.jpg" },
  homeStrip3: { field: "home_strip_3", thumb: "800x0", fallback: "/placeholders/cyclist-bw-race.jpg" },
  homeEditorial1: { field: "home_editorial_1", thumb: "800x0", fallback: "/placeholders/cyclist-duo.jpg" },
  homeEditorial2: { field: "home_editorial_2", thumb: "800x0", fallback: "/placeholders/cyclist-bw-race.jpg" },
  homeCraft1: { field: "home_craft_1", thumb: "800x0", fallback: "/placeholders/cyclist-pack.jpg" },
  homeCraft2: { field: "home_craft_2", thumb: "800x0", fallback: "/placeholders/cyclist-portrait.jpg" },
  aboutPortrait: { field: "about_portrait", thumb: "1200x0", fallback: "/placeholders/cyclist-portrait.jpg" },
} as const satisfies Record<string, SiteImageSlot>;

export type SiteImageSlotName = keyof typeof SITE_IMAGE_SLOTS;

/** URL a mostrar para un slot: la del CMS si el cliente subió una imagen, el
 *  placeholder local si no (o si el backend no respondió). */
export function siteImageUrl(
  record: SiteImages | null,
  slot: SiteImageSlotName,
): string {
  const { field, thumb, fallback } = SITE_IMAGE_SLOTS[slot];
  if (!record) return fallback;
  const filename = record[field];
  if (!filename) return fallback;
  return fileUrl({ collectionName: "site_images", id: record.id }, filename, {
    thumb,
  });
}
