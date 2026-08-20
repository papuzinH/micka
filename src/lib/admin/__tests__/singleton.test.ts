import { describe, it, expect } from "vitest";
import type { CollectionConfig } from "../collections";
import { singletonTarget } from "../singleton";

const base: CollectionConfig = {
  name: "site_images",
  slug: "site-images",
  label: "Site images",
  labelSingular: "Site images",
  titleField: "id",
  defaultSort: "created",
  fields: [],
};

describe("singletonTarget", () => {
  it("devuelve la ruta del único registro de una colección singleton", () => {
    expect(
      singletonTarget({ ...base, singleton: true }, [{ id: "abc123" }]),
    ).toBe("/admin/site-images/abc123");
  });

  it("devuelve null si la colección no es singleton", () => {
    expect(singletonTarget(base, [{ id: "abc123" }])).toBeNull();
  });

  it("devuelve null si todavía no hay registro (hay que correr el seed)", () => {
    expect(singletonTarget({ ...base, singleton: true }, [])).toBeNull();
  });
});
