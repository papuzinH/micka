import { describe, it, expect, vi, beforeEach } from "vitest";

const getFullList = vi.fn();
const getFirstListItem = vi.fn();
const getList = vi.fn();
const collection = vi.fn(() => ({ getFullList, getFirstListItem, getList }));

vi.mock("../client", () => ({
  createPocketBase: () => ({ collection }),
  getPocketBaseUrl: () => "https://micka.lhstudio.com.ar",
}));

import {
  localized,
  getCategories,
  getAlbums,
  getStarredAlbums,
  getAlbumBySlug,
  getPhotosByAlbum,
  getFavePhotos,
  getReviews,
  getCollabs,
  getSiteContent,
} from "../queries";

beforeEach(() => {
  vi.clearAllMocks();
  getFullList.mockResolvedValue([]);
  getList.mockResolvedValue({ items: [] });
});

describe("localized", () => {
  const rec = { title_en: "Race", title_fr: "Course" };
  it("devuelve la variante del locale pedido", () => {
    expect(localized(rec, "title", "fr")).toBe("Course");
  });
  it("cae a _en si falta el locale", () => {
    expect(localized(rec, "title", "de")).toBe("Race");
  });
  it("devuelve cadena vacía si no hay valor", () => {
    expect(localized({}, "title", "en")).toBe("");
  });
});

describe("queries con filtros y sort", () => {
  it("getCategories ordena por order", async () => {
    await getCategories();
    expect(collection).toHaveBeenCalledWith("categories");
    expect(getFullList).toHaveBeenCalledWith({ sort: "order" });
  });

  it("getStarredAlbums filtra por starred", async () => {
    await getStarredAlbums();
    expect(getFullList).toHaveBeenCalledWith({
      sort: "order",
      filter: "starred = true",
    });
  });

  it("getAlbums filtra por categoría cuando se pasa", async () => {
    await getAlbums({ category: "abc" });
    expect(getFullList).toHaveBeenCalledWith({
      sort: "order",
      filter: 'category = "abc"',
    });
  });

  it("getAlbums sin categoría usa filtro vacío", async () => {
    await getAlbums();
    expect(getFullList).toHaveBeenCalledWith({ sort: "order", filter: "" });
  });

  it("getPhotosByAlbum filtra por album", async () => {
    await getPhotosByAlbum("alb1");
    expect(getFullList).toHaveBeenCalledWith({
      sort: "order",
      filter: 'album = "alb1"',
    });
  });

  it("getReviews y getCollabs ordenan por order", async () => {
    await getReviews();
    await getCollabs();
    expect(collection).toHaveBeenCalledWith("reviews");
    expect(collection).toHaveBeenCalledWith("collabs");
  });
});

describe("getAlbumBySlug", () => {
  it("devuelve el álbum cuando existe", async () => {
    getFirstListItem.mockResolvedValue({ id: "a1", slug: "x" });
    const album = await getAlbumBySlug("x");
    expect(getFirstListItem).toHaveBeenCalledWith('slug = "x"');
    expect(album).toEqual({ id: "a1", slug: "x" });
  });
  it("devuelve null si no existe (404 del SDK)", async () => {
    getFirstListItem.mockRejectedValue(new Error("404"));
    expect(await getAlbumBySlug("nope")).toBeNull();
  });
});

describe("getFavePhotos", () => {
  it("pide la página filtrando por álbum publicado y devuelve items", async () => {
    getList.mockResolvedValue({ items: [{ id: "p1" }, { id: "p2" }] });
    const photos = await getFavePhotos(2);
    expect(getList).toHaveBeenCalledWith(1, 2, {
      sort: "order,-created",
      filter: "album.published = true",
    });
    expect(photos).toHaveLength(2);
  });
});

describe("getSiteContent", () => {
  it("devuelve un mapa por key", async () => {
    getFullList.mockResolvedValue([
      { id: "1", key: "hero_title", value_en: "Hi", value_fr: "Salut" },
      { id: "2", key: "footer", value_en: "F", value_fr: "F" },
    ]);
    const map = await getSiteContent();
    expect(Object.keys(map)).toEqual(["hero_title", "footer"]);
    expect(map.hero_title.value_fr).toBe("Salut");
  });
});

describe("resiliencia", () => {
  it("getCategories devuelve [] si el backend falla", async () => {
    getFullList.mockRejectedValue(new Error("network"));
    expect(await getCategories()).toEqual([]);
  });
});
