import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { GrowLine } from "../GrowLine";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe("GrowLine", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renderiza sin crashear (eje y por defecto)", () => {
    mockMatchMedia(false);
    const { container } = render(<GrowLine className="w-0.5 bg-brand-violet" />);
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("bajo reduced-motion no aplica transform", () => {
    mockMatchMedia(true);
    const { container } = render(<GrowLine axis="x" className="h-0.5 bg-brand-violet" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.transform).toBe("");
  });
});
