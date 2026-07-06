import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { createElement } from "react";

// jsdom no implementa matchMedia; default a "no reduced motion" (matches:
// false) — los tests que necesiten reduced-motion=true lo sobreescriben.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock next/image as a plain <img> for the jsdom environment.
vi.mock("next/image", () => ({
  default: ({
    src,
    alt = "",
    width,
    height,
    className,
  }: Record<string, unknown>) =>
    createElement("img", {
      src: typeof src === "string" ? src : (src as { src?: string })?.src,
      alt,
      width,
      height,
      className,
    }),
}));
