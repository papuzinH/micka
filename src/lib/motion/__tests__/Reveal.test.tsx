import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Reveal } from "../Reveal";

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

describe("Reveal", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("siempre renderiza children", () => {
    mockMatchMedia(false);
    render(
      <Reveal>
        <p>hola</p>
      </Reveal>
    );
    expect(screen.getByText("hola")).toBeInTheDocument();
  });

  it("respeta el prop `as` para el tag del wrapper", () => {
    mockMatchMedia(false);
    render(
      <Reveal as="h1">
        <span>título</span>
      </Reveal>
    );
    expect(screen.getByText("título").parentElement?.tagName).toBe("H1");
  });

  it("bajo reduced-motion no aplica estado inicial oculto (queda visible)", () => {
    mockMatchMedia(true);
    render(
      <Reveal>
        <p>hola</p>
      </Reveal>
    );
    const el = screen.getByText("hola").parentElement as HTMLElement;
    expect(el.style.opacity).not.toBe("0");
  });

  it("sin matchMedia disponible degrada a visible (no oculta)", () => {
    // @ts-expect-error simula un entorno sin matchMedia
    window.matchMedia = undefined;
    render(
      <Reveal>
        <p>hola</p>
      </Reveal>
    );
    const el = screen.getByText("hola").parentElement as HTMLElement;
    expect(el.style.opacity).not.toBe("0");
  });
});
