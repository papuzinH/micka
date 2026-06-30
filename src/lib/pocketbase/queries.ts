import { createPocketBase } from "./client";
import type {
  Album,
  Category,
  Collab,
  Photo,
  Review,
  SiteContent,
} from "./types";

export type Locale = "en" | "fr";

/**
 * Devuelve el valor localizado de un campo con variantes `_en`/`_fr`.
 * Cae a la variante `_en` si la del locale pedido no existe.
 */
export function localized(
  record: Record<string, unknown>,
  field: string,
  locale: string,
): string {
  const value = record[`${field}_${locale}`] ?? record[`${field}_en`];
  return typeof value === "string" ? value : "";
}

/**
 * Las queries del sitio público son resilientes por diseño: si el backend no
 * responde (build SSG, caída momentánea), devuelven vacío en vez de romper el
 * render. Los `listRule`/`viewRule` del esquema ya restringen a `published`.
 */
async function safeList<T>(run: () => Promise<T[]>): Promise<T[]> {
  try {
    return await run();
  } catch (err) {
    console.error("[pocketbase] query falló:", err);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  const pb = createPocketBase();
  return safeList(() =>
    pb.collection("categories").getFullList<Category>({ sort: "order" }),
  );
}

export async function getAlbums(opts?: {
  category?: string;
}): Promise<Album[]> {
  const pb = createPocketBase();
  const filter = opts?.category ? `category = "${opts.category}"` : "";
  return safeList(() =>
    pb.collection("albums").getFullList<Album>({ sort: "order", filter }),
  );
}

export async function getStarredAlbums(): Promise<Album[]> {
  const pb = createPocketBase();
  return safeList(() =>
    pb
      .collection("albums")
      .getFullList<Album>({ sort: "order", filter: "starred = true" }),
  );
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const pb = createPocketBase();
  try {
    return await pb
      .collection("albums")
      .getFirstListItem<Album>(`slug = "${slug}"`);
  } catch {
    return null;
  }
}

export async function getPhotosByAlbum(albumId: string): Promise<Photo[]> {
  const pb = createPocketBase();
  return safeList(() =>
    pb
      .collection("photos")
      .getFullList<Photo>({ sort: "order", filter: `album = "${albumId}"` }),
  );
}

/**
 * "My faves of all time" del Home. No hay flag de foto-destacada en el esquema,
 * así que se toman las primeras fotos de álbumes publicados (filtrando por la
 * relación). Se puede curar luego reordenando en el admin.
 */
export async function getFavePhotos(limit = 5): Promise<Photo[]> {
  const pb = createPocketBase();
  try {
    const list = await pb.collection("photos").getList<Photo>(1, limit, {
      sort: "order,-created",
      filter: "album.published = true",
    });
    return list.items;
  } catch (err) {
    console.error("[pocketbase] getFavePhotos falló:", err);
    return [];
  }
}

export async function getReviews(): Promise<Review[]> {
  const pb = createPocketBase();
  return safeList(() =>
    pb.collection("reviews").getFullList<Review>({ sort: "order" }),
  );
}

export async function getCollabs(): Promise<Collab[]> {
  const pb = createPocketBase();
  return safeList(() =>
    pb.collection("collabs").getFullList<Collab>({ sort: "order" }),
  );
}

/** Mapa `key → SiteContent` para acceso directo por clave editable. */
export async function getSiteContent(): Promise<Record<string, SiteContent>> {
  const pb = createPocketBase();
  const items = await safeList(() =>
    pb.collection("site_content").getFullList<SiteContent>(),
  );
  return Object.fromEntries(items.map((item) => [item.key, item]));
}
