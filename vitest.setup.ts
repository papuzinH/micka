import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, vi } from "vitest";
import { createElement } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

// Higiene global: matar cualquier ScrollTrigger que haya sobrevivido al
// cleanup de un test (normalmente `useGSAP` los revierte al desmontar, pero
// esto es una red de seguridad extra) — evita timers internos de ScrollTrigger
// disparando después de que jsdom ya desmontó su entorno para el archivo.
afterEach(() => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
});

// ScrollTrigger arranca un `setInterval(_sync, 250)` interno en su core-init
// (node_modules/gsap/ScrollTrigger.js) sin ninguna API pública para
// cancelarlo (ScrollTrigger.config({ syncInterval: 0 }) no lo limpia — es un
// bug/quirk de la librería). Ese interval sigue vivo después de que termina
// el archivo de test y, al disparar en un entorno jsdom ya destruido, tira
// "ReferenceError: requestAnimationFrame is not defined" — a veces con exit
// code no-cero. Capturamos cada `setInterval` creado durante el archivo y los
// limpiamos todos al final, sin depender de las internals de GSAP.
const activeIntervals = new Set<ReturnType<typeof setInterval>>();
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;
globalThis.setInterval = ((...args: Parameters<typeof setInterval>) => {
  const id = originalSetInterval(...args);
  activeIntervals.add(id);
  return id;
}) as typeof setInterval;
globalThis.clearInterval = ((id?: Parameters<typeof clearInterval>[0]) => {
  if (id !== undefined) activeIntervals.delete(id as ReturnType<typeof setInterval>);
  return originalClearInterval(id);
}) as typeof clearInterval;

afterAll(() => {
  activeIntervals.forEach((id) => originalClearInterval(id));
  activeIntervals.clear();
});

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
