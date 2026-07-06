import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StaggerGroup } from "../StaggerGroup";

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

describe("StaggerGroup", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("siempre renderiza sus hijos", () => {
    mockMatchMedia(false);
    render(
      <StaggerGroup>
        <p>uno</p>
        <p>dos</p>
      </StaggerGroup>
    );
    expect(screen.getByText("uno")).toBeInTheDocument();
    expect(screen.getByText("dos")).toBeInTheDocument();
  });

  it("bajo reduced-motion no oculta los hijos", () => {
    mockMatchMedia(true);
    render(
      <StaggerGroup>
        <p>uno</p>
        <p>dos</p>
      </StaggerGroup>
    );
    expect(screen.getByText("uno")).toHaveStyle({ opacity: "" });
    expect(screen.getByText("dos")).toHaveStyle({ opacity: "" });
  });

  it("sin matchMedia disponible degrada a visible (no oculta)", () => {
    // @ts-expect-error simula un entorno sin matchMedia
    window.matchMedia = undefined;
    render(
      <StaggerGroup>
        <p>uno</p>
      </StaggerGroup>
    );
    expect(screen.getByText("uno").style.opacity).not.toBe("0");
  });
});
