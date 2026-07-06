import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SplitReveal } from "../SplitReveal";

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

describe("SplitReveal", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renderiza el texto", () => {
    mockMatchMedia(false);
    const { container } = render(
      <SplitReveal>
        <span>Nothing is left to chance</span>
      </SplitReveal>
    );
    expect(container.textContent).toContain("Nothing is left to chance");
  });

  it("bajo reduced-motion NO parte el texto (accesible para lectores de pantalla)", () => {
    mockMatchMedia(true);
    render(
      <SplitReveal>
        <span>Nothing is left to chance</span>
      </SplitReveal>
    );
    // El nodo de texto original sigue intacto (SplitText lo hubiera partido en spans por línea/palabra).
    expect(screen.getByText("Nothing is left to chance")).toBeInTheDocument();
  });
});
