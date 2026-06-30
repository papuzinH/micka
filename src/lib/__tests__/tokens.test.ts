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

  it("define la escala tipográfica del Figma", () => {
    const fontSize = (tailwindConfig.theme?.extend?.fontSize as any);
    // H1 = Syne ExtraBold 45px
    expect(fontSize.h1[0]).toBe("45px");
    expect(fontSize.h1[1].fontWeight).toBe("800");
    // H2 = Syne Bold 30px
    expect(fontSize.h2[0]).toBe("30px");
    expect(fontSize.h2[1].fontWeight).toBe("700");
    // Card Title = Syne Bold 20px
    expect(fontSize.card[0]).toBe("20px");
    // Body = Inter Regular 14px
    expect(fontSize.body[0]).toBe("14px");
    expect(fontSize["body-semibold"][1].fontWeight).toBe("600");
  });
});
