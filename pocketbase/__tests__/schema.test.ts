import { describe, it, expect } from "vitest";
import schema from "../pb_schema.json";

const collections = (schema as Array<{ name: string; fields: Array<{ name: string }> }>);
const names = collections.map((c) => c.name);

describe("pb schema", () => {
  it("incluye las 7 colecciones del CMS", () => {
    for (const name of [
      "categories",
      "albums",
      "photos",
      "reviews",
      "collabs",
      "site_content",
      "contact_messages",
    ]) {
      expect(names).toContain(name);
    }
  });

  it("albums tiene campos bilingües, starred y published", () => {
    const albums = collections.find((c) => c.name === "albums")!;
    const fields = albums.fields.map((f) => f.name);
    expect(fields).toEqual(
      expect.arrayContaining(["title_en", "title_fr", "starred", "published"]),
    );
  });

  it("contact_messages permite create público y restringe lectura", () => {
    const cm = schema.find((c: { name: string }) => c.name === "contact_messages") as {
      createRule: string | null;
      listRule: string | null;
    };
    expect(cm.createRule).toBe("");
    expect(cm.listRule).toBeNull();
  });
});

const SITE_IMAGE_FIELDS = [
  "home_hero",
  "home_portrait",
  "home_strip_1",
  "home_strip_2",
  "home_strip_3",
  "home_editorial_1",
  "home_editorial_2",
  "home_craft_1",
  "home_craft_2",
  "about_portrait",
];

describe("site_images", () => {
  const col = () =>
    (schema as Array<Record<string, unknown>>).find(
      (c) => c.name === "site_images",
    ) as {
      fields: Array<{
        name: string;
        type: string;
        maxSize?: number;
        thumbs?: string[];
      }>;
      listRule: string | null;
      viewRule: string | null;
      createRule: string | null;
    };

  it("existe y declara los diez campos de imagen", () => {
    const fields = col().fields.filter((f) => f.type === "file");
    expect(fields.map((f) => f.name)).toEqual(SITE_IMAGE_FIELDS);
  });

  it("cada campo acepta 15MB y declara el whitelist completo de thumbs", () => {
    for (const f of col().fields.filter((f) => f.type === "file")) {
      expect(f.maxSize).toBe(15728640);
      expect(f.thumbs).toEqual(["400x0", "800x0", "1200x0", "1920x0"]);
    }
  });

  it("es de lectura pública y no se puede crear ni borrar desde la API", () => {
    expect(col().listRule).toBe("");
    expect(col().viewRule).toBe("");
    expect(col().createRule).toBeNull();
  });
});
