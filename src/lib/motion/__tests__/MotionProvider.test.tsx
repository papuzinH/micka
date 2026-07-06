import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { LenisMock } = vi.hoisted(() => {
  const LenisMock = vi.fn().mockImplementation(function (
    this: Record<string, unknown>
  ) {
    this.on = vi.fn();
    this.off = vi.fn();
    this.raf = vi.fn();
    this.destroy = vi.fn();
  });
  return { LenisMock };
});

vi.mock("lenis", () => ({ default: LenisMock }));

import { MotionProvider } from "../MotionProvider";

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

describe("MotionProvider", () => {
  afterEach(() => {
    // No usar vi.restoreAllMocks(): LenisMock no es un spy sobre un método
    // real, así que "restaurar" borraría su mockImplementation (dejaría de
    // devolver una instancia con on/off/raf/destroy) para el resto de tests.
    LenisMock.mockClear();
  });

  it("siempre renderiza children", () => {
    mockMatchMedia(false);
    render(
      <MotionProvider>
        <p>contenido</p>
      </MotionProvider>
    );
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });

  it("instancia Lenis cuando no hay reduced motion", () => {
    mockMatchMedia(false);
    render(
      <MotionProvider>
        <p>contenido</p>
      </MotionProvider>
    );
    expect(LenisMock).toHaveBeenCalledTimes(1);
  });

  it("NO instancia Lenis bajo prefers-reduced-motion (scroll nativo)", () => {
    mockMatchMedia(true);
    render(
      <MotionProvider>
        <p>contenido</p>
      </MotionProvider>
    );
    expect(LenisMock).not.toHaveBeenCalled();
  });
});
