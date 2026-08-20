import { describe, it, expect } from "vitest";
import { COLLECTIONS, getCollection } from "../collections";
import { SITE_IMAGE_SLOTS } from "../../pocketbase/site-images";
import pbSchema from "../../../../pocketbase/pb_schema.json";

describe("site_images", () => {
  const col = () => getCollection("site-images")!;

  it("está registrada y es singleton de solo edición", () => {
    expect(col()).toBeDefined();
    expect(col().singleton).toBe(true);
    expect(col().canCreate).toBe(false);
  });

  it("declara los diez slots como campos file, todos con label y ayuda", () => {
    const fields = col().fields;
    expect(fields).toHaveLength(10);
    for (const f of fields) {
      expect(f.type).toBe("file");
      expect(f.label).toBeTruthy();
      expect(f.help).toBeTruthy();
      expect(f.thumb).toBeTruthy();
    }
  });

  it("ninguna otra colección es singleton", () => {
    const others = COLLECTIONS.filter((c) => c.slug !== "site-images");
    expect(others.every((c) => !c.singleton)).toBe(true);
  });

  it("los nombres de campo coinciden, en orden, con el schema y con SITE_IMAGE_SLOTS", () => {
    // Nada liga `collections.ts` al esquema real a nivel de compilador (son
    // strings sueltos) — un typo acá hace que el form del admin postee una
    // key que PocketBase ignora, y ese slot no se guarda nunca sin que nada
    // avise. Este test es el único cruce entre los tres lugares que listan
    // los diez nombres.
    const schemaFieldNames = (
      pbSchema as Array<{ name: string; fields: Array<{ name: string; type: string }> }>
    )
      .find((c) => c.name === "site_images")!
      .fields.filter((f) => f.type === "file")
      .map((f) => f.name);

    const configFieldNames = col().fields.map((f) => f.name);
    const slotFieldNames = Object.values(SITE_IMAGE_SLOTS).map((s) => s.field);

    expect(configFieldNames).toEqual(schemaFieldNames);
    expect(slotFieldNames).toEqual(schemaFieldNames);
  });
});
