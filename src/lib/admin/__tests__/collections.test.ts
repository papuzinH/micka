import { describe, it, expect } from "vitest";
import { COLLECTIONS, getCollection } from "../collections";

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
});
