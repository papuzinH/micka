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
