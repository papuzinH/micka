import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { siteImageUrl, SITE_IMAGE_SLOTS } from "../site-images";
import type { SiteImages } from "../types";

const BASE = "https://micka.lhstudio.com.ar";

const empty: SiteImages = {
  id: "rec123",
  home_hero: "",
  home_portrait: "",
  home_strip_1: "",
  home_strip_2: "",
  home_strip_3: "",
  home_editorial_1: "",
  home_editorial_2: "",
  home_craft_1: "",
  home_craft_2: "",
  about_portrait: "",
};

describe("siteImageUrl", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_POCKETBASE_URL = BASE;
  });
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_POCKETBASE_URL;
  });

  it("devuelve la URL del CMS con el thumb del slot cuando hay archivo", () => {
    const rec = { ...empty, about_portrait: "micka.jpg" };
    expect(siteImageUrl(rec, "aboutPortrait")).toBe(
      `${BASE}/api/files/site_images/rec123/micka.jpg?thumb=1200x0`,
    );
  });

  it("pide 1920x0 para el hero, que se sirve a pantalla completa", () => {
    const rec = { ...empty, home_hero: "bg.jpg" };
    expect(siteImageUrl(rec, "homeHero")).toContain("thumb=1920x0");
  });

  it("cae al placeholder local cuando el slot está vacío", () => {
    expect(siteImageUrl(empty, "aboutPortrait")).toBe(
      "/placeholders/cyclist-portrait.jpg",
    );
  });

  it("cae al placeholder cuando el backend no devolvió registro", () => {
    expect(siteImageUrl(null, "homeHero")).toBe(
      "/placeholders/cyclist-road.jpg",
    );
  });

  it("cubre los diez slots y todos apuntan a un placeholder existente", () => {
    const slots = Object.values(SITE_IMAGE_SLOTS);
    expect(slots).toHaveLength(10);
    for (const slot of slots) {
      expect(slot.fallback).toMatch(/^\/placeholders\/[\w-]+\.(jpg|png)$/);
      expect(["400x0", "800x0", "1200x0", "1920x0"]).toContain(slot.thumb);
      // `fallback` es una ruta pública ("/placeholders/x.jpg"); el archivo real
      // vive en `public/`, así que se resuelve desde la raíz del repo.
      const filePath = path.join(process.cwd(), "public", slot.fallback);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });
});
