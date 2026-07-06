"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function getInitialReducedMotion(): boolean {
  // Server: sin `window`, no afecta el markup (el valor solo gobierna
  // efectos imperativos) → default `false` es inofensivo.
  if (typeof window === "undefined") return false;
  // Cliente sin `matchMedia` (navegador muy viejo / entorno degradado): no
  // hay forma de confirmar la preferencia del usuario → tratamos como
  // reduced-motion para no animar de más ("degradan a visible").
  if (!window.matchMedia) return true;
  return window.matchMedia(QUERY).matches;
}

/**
 * Lee `prefers-reduced-motion`. SSR-safe: devuelve `false` en el server (no
 * hay `window`) y no afecta el markup, así que no hay mismatch de
 * hidratación. En el cliente el valor inicial se calcula de forma síncrona
 * (lazy initializer), no en un efecto: si se difiriera a `useEffect`, el
 * primer render del cliente vería `reducedMotion=false` durante un tick —
 * tiempo suficiente para que `MotionProvider` instancie Lenis antes de
 * corregirse, un flash real (detectado con un test que falla si Lenis se
 * llega a instanciar bajo reduced-motion).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getInitialReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    // El valor inicial ya se calculó en el lazy initializer; acá solo nos
    // suscribimos a cambios futuros (el usuario alterna la preferencia en vivo).
    const mql = window.matchMedia(QUERY);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  return reduced;
}
