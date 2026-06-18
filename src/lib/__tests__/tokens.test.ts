import { describe, it, expect } from "vitest";
import tailwindConfig from "../../../tailwind.config";

describe("design tokens", () => {
  it("define los colores de marca del Figma", () => {
    const colors = (tailwindConfig.theme?.extend?.colors as any).brand;
    expect(colors.violet).toBe("#a020f0");
    expect(colors["gray-bg"]).toBe("#212121");
    expect(colors.black).toBe("#000000");
    expect(colors.gray).toBe("#202020");
    expect(colors["gray-light"]).toBe("#373636");
    expect(colors.white).toBe("#ffffff");
    expect(colors["violet-dark"]).toBe("#8315c8");
  });
});
