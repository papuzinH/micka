import { describe, it, expect } from "vitest";
import { parseAuthCookie, isValidAuth } from "../auth";

describe("admin auth helpers", () => {
  it("isValidAuth es false con cookie vacía", () => {
    expect(isValidAuth("")).toBe(false);
  });

  it("parseAuthCookie devuelve null con valor inválido", () => {
    expect(parseAuthCookie("no-es-json")).toBeNull();
  });

  it("parseAuthCookie extrae el token de un cookie válido", () => {
    const cookie = JSON.stringify({ token: "abc", record: { id: "1" } });
    expect(parseAuthCookie(cookie)?.token).toBe("abc");
  });
});
