"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap } from "./register";
import { useReducedMotion } from "./useReducedMotion";

type MotionSettings = { reducedMotion: boolean };

const MotionContext = createContext<MotionSettings>({ reducedMotion: false });

/** Lee el estado global de motion (hoy solo `reducedMotion`) sin volver a suscribirse a `matchMedia`. */
export function useMotionSettings(): MotionSettings {
  return useContext(MotionContext);
}

/**
 * Inicializa GSAP/ScrollTrigger + smooth scroll (Lenis) una sola vez para
 * todo el sitio público. Bajo `prefers-reduced-motion` no crea Lenis (queda
 * scroll nativo) y expone `reducedMotion` por contexto para el resto de la
 * capa de motion.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    registerGsap();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis();
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return (
    <MotionContext.Provider value={{ reducedMotion }}>
      {children}
    </MotionContext.Provider>
  );
}
