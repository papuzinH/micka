"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap } from "./register";
import { useReducedMotion } from "./useReducedMotion";

type MotionSettings = {
  reducedMotion: boolean;
  /** Ref (no state): leer `.current` no necesita re-renderizar a los consumidores. */
  lenisRef: RefObject<Lenis | null>;
};

const MotionContext = createContext<MotionSettings>({
  reducedMotion: false,
  lenisRef: { current: null },
});

/** Lee el estado global de motion (`reducedMotion` + la instancia de Lenis) sin volver a suscribirse a `matchMedia`. */
export function useMotionSettings(): MotionSettings {
  return useContext(MotionContext);
}

/**
 * Inicializa GSAP/ScrollTrigger + smooth scroll (Lenis) una sola vez para
 * todo el sitio público. Bajo `prefers-reduced-motion` no crea Lenis (queda
 * scroll nativo) y expone `reducedMotion` + la instancia de Lenis por
 * contexto para el resto de la capa de motion.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    registerGsap();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const instance = new Lenis();
    lenisRef.current = instance;
    const onScroll = () => ScrollTrigger.update();
    instance.on("scroll", onScroll);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.off("scroll", onScroll);
      instance.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <MotionContext.Provider value={{ reducedMotion, lenisRef }}>
      {children}
    </MotionContext.Provider>
  );
}
