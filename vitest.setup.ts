import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { createElement } from "react";

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
