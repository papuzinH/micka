import { describe, it, expect, beforeEach } from "vitest";
import { createPocketBase, getPocketBaseUrl } from "../client";

describe("pocketbase client", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_POCKETBASE_URL = "https://micka-api.lhstudio.com.ar";
  });

  it("getPocketBaseUrl devuelve la URL del env", () => {
    expect(getPocketBaseUrl()).toBe("https://micka-api.lhstudio.com.ar");
  });

  it("createPocketBase usa baseURL del env", () => {
    const pb = createPocketBase();
    expect(pb.baseURL).toBe("https://micka-api.lhstudio.com.ar");
  });

  it("lanza si falta la env var", () => {
    delete process.env.NEXT_PUBLIC_POCKETBASE_URL;
    expect(() => getPocketBaseUrl()).toThrow(/POCKETBASE_URL/);
  });
});
