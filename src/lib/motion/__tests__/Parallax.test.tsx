import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Parallax } from "../Parallax";

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

describe("Parallax", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("siempre renderiza children", () => {
    mockMatchMedia(false);
    render(
      <Parallax>
        <p>foto</p>
      </Parallax>
    );
    expect(screen.getByText("foto")).toBeInTheDocument();
  });

  it("bajo reduced-motion no aplica transform", () => {
    mockMatchMedia(true);
    render(
      <Parallax>
        <p>foto</p>
      </Parallax>
    );
    const el = screen.getByText("foto").parentElement as HTMLElement;
    expect(el.style.transform).toBe("");
  });

  it("con oversize, bajo reduced-motion tampoco deja un scale estático", () => {
    // Regresión: `oversize` solo debe aplicar scale(1.1) cuando el parallax
    // realmente corre (desktop + sin reduced-motion) — nunca como zoom
    // permanente vía reduced-motion.
    mockMatchMedia(true);
    render(
      <Parallax oversize>
        <p>foto</p>
      </Parallax>
    );
    const el = screen.getByText("foto").parentElement as HTMLElement;
    expect(el.style.transform).toBe("");
  });
});
