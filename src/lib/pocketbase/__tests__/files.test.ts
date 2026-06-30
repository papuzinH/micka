import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fileUrl } from "../files";

const BASE = "https://micka.lhstudio.com.ar";

describe("fileUrl", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_POCKETBASE_URL = BASE;
  });
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_POCKETBASE_URL;
  });

  it("construye la URL canónica de PocketBase desde collectionName + id + filename", () => {
    expect(
      fileUrl({ collectionName: "albums", id: "rec123" }, "cover.jpg"),
    ).toBe(`${BASE}/api/files/albums/rec123/cover.jpg`);
  });

  it("agrega el query param thumb cuando se pide", () => {
    expect(
      fileUrl({ collectionName: "albums", id: "rec123" }, "cover.jpg", {
        thumb: "600x0",
      }),
    ).toBe(`${BASE}/api/files/albums/rec123/cover.jpg?thumb=600x0`);
  });

  it("usa collectionId si no hay collectionName", () => {
    expect(
      fileUrl({ collectionId: "col_albums00000001", id: "rec123" }, "p.webp"),
    ).toBe(`${BASE}/api/files/col_albums00000001/rec123/p.webp`);
  });

  it("devuelve cadena vacía si el filename está vacío (campo file opcional sin valor)", () => {
    expect(fileUrl({ collectionName: "albums", id: "rec123" }, "")).toBe("");
  });

  it("lanza si el record no tiene colección resoluble", () => {
    expect(() => fileUrl({ id: "rec123" }, "cover.jpg")).toThrow(/colección/);
  });
});
