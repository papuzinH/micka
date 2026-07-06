import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Marquee } from "../Marquee";

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

describe("Marquee", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("siempre renderiza children", () => {
    mockMatchMedia(false);
    render(
      <Marquee>
        <span>texto texto</span>
      </Marquee>
    );
    expect(screen.getByText("texto texto")).toBeInTheDocument();
  });

  it("bajo reduced-motion queda estático (sin transform)", () => {
    mockMatchMedia(true);
    render(
      <Marquee>
        <span>texto texto</span>
      </Marquee>
    );
    const el = screen.getByText("texto texto").parentElement as HTMLElement;
    expect(el.style.transform).toBe("");
  });
});
