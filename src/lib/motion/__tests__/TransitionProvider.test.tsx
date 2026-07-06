/* eslint-disable @next/next/no-html-link-for-pages -- se testea el interceptor de clicks sobre <a> planos a propósito (simula lo que next-intl's Link renderiza en el DOM) */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const { pushMock, pathnameState } = vi.hoisted(() => {
  const pushMock = vi.fn();
  const pathnameState = { current: "/en" };
  return { pushMock, pathnameState };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameState.current,
}));

const { LenisMock, lenisScrollTo } = vi.hoisted(() => {
  const lenisScrollTo = vi.fn();
  const LenisMock = vi.fn().mockImplementation(function (
    this: Record<string, unknown>
  ) {
    this.on = vi.fn();
    this.off = vi.fn();
    this.raf = vi.fn();
    this.destroy = vi.fn();
    this.scrollTo = lenisScrollTo;
  });
  return { LenisMock, lenisScrollTo };
});
vi.mock("lenis", () => ({ default: LenisMock }));

import { TransitionProvider } from "../TransitionProvider";
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

function clickAnchor(anchor: HTMLAnchorElement, init: MouseEventInit = {}) {
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    button: 0,
    ...init,
  });
  anchor.dispatchEvent(event);
  return event;
}

describe("TransitionProvider", () => {
  afterEach(() => {
    // No usar vi.restoreAllMocks(): LenisMock/pushMock no son spies sobre un
    // método real, así que "restaurar" borraría su mockImplementation para
    // el resto de los tests (mismo bug ya documentado en MotionProvider.test.tsx).
    cleanup();
    pushMock.mockClear();
    lenisScrollTo.mockClear();
    LenisMock.mockClear();
    pathnameState.current = "/en";
  });

  it("renderiza children", () => {
    mockMatchMedia(false);
    render(
      <TransitionProvider>
        <p>contenido</p>
      </TransitionProvider>
    );
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });

  it("bajo reduced-motion, click en link interno navega directo (sin cortina)", () => {
    mockMatchMedia(true);
    render(
      <TransitionProvider>
        <a href="/en/portfolio">Portfolio</a>
      </TransitionProvider>
    );
    const event = clickAnchor(screen.getByText("Portfolio") as HTMLAnchorElement);
    expect(pushMock).toHaveBeenCalledWith("/en/portfolio");
    expect(event.defaultPrevented).toBe(true);
  });

  it("intercepta (preventDefault) links internos incluso sin reduced-motion", () => {
    mockMatchMedia(false);
    render(
      <TransitionProvider>
        <a href="/en/about">About</a>
      </TransitionProvider>
    );
    const event = clickAnchor(screen.getByText("About") as HTMLAnchorElement);
    expect(event.defaultPrevented).toBe(true);
  });

  it("no intercepta links externos (otro origin)", () => {
    mockMatchMedia(false);
    render(
      <TransitionProvider>
        <a href="https://example.com">Externo</a>
      </TransitionProvider>
    );
    const event = clickAnchor(screen.getByText("Externo") as HTMLAnchorElement);
    expect(event.defaultPrevented).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("no intercepta anchors con target=_blank", () => {
    mockMatchMedia(false);
    render(
      <TransitionProvider>
        <a href="/en/about" target="_blank">
          Nueva pestaña
        </a>
      </TransitionProvider>
    );
    const event = clickAnchor(screen.getByText("Nueva pestaña") as HTMLAnchorElement);
    expect(event.defaultPrevented).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("no intercepta clicks con modificadores (ctrl/meta/shift/alt) ni el botón secundario", () => {
    mockMatchMedia(false);
    render(
      <TransitionProvider>
        <a href="/en/about">About</a>
      </TransitionProvider>
    );
    const anchor = screen.getByText("About") as HTMLAnchorElement;
    const event = clickAnchor(anchor, { ctrlKey: true });
    expect(event.defaultPrevented).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("no reintercepta un evento que ya llega con defaultPrevented", () => {
    mockMatchMedia(false);
    render(
      <TransitionProvider>
        <a href="/en/about">About</a>
      </TransitionProvider>
    );
    const anchor = screen.getByText("About") as HTMLAnchorElement;
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    event.preventDefault();
    anchor.dispatchEvent(event);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("no bloquea el bubbling: un onClick de React en un ancestro del link sigue disparando", () => {
    // Regresión real: el Navbar cierra el menú mobile con un onClick en el
    // div contenedor del overlay, que depende de que el click en un
    // MenuItem interno burbujee hasta ahí. Si el interceptor llamara
    // stopPropagation(), este handler nunca se enteraría del click.
    mockMatchMedia(false);
    const onAncestorClick = vi.fn();
    render(
      <TransitionProvider>
        <div onClick={onAncestorClick}>
          <a href="/en/about">About</a>
        </div>
      </TransitionProvider>
    );
    clickAnchor(screen.getByText("About") as HTMLAnchorElement);
    expect(onAncestorClick).toHaveBeenCalledTimes(1);
  });

  it("al cambiar de ruta, resetea el scroll de Lenis (immediate)", () => {
    mockMatchMedia(false);
    const { rerender } = render(
      <MotionProvider>
        <TransitionProvider>
          <p>home</p>
        </TransitionProvider>
      </MotionProvider>
    );

    pathnameState.current = "/en/about";
    rerender(
      <MotionProvider>
        <TransitionProvider>
          <p>home</p>
        </TransitionProvider>
      </MotionProvider>
    );

    expect(lenisScrollTo).toHaveBeenCalledWith(0, { immediate: true });
  });
});
