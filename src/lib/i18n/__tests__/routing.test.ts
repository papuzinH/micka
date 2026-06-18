import { describe, it, expect } from "vitest";
import { routing } from "../routing";

describe("i18n routing", () => {
  it("soporta en y fr con en por defecto", () => {
    expect(routing.locales).toEqual(["en", "fr"]);
    expect(routing.defaultLocale).toBe("en");
  });
});
