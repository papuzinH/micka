"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "./register";
import { useReducedMotion } from "./useReducedMotion";

type ParallaxProps = {
  children: ReactNode;
  /** Fracción de la altura de viewport que se desplaza `children` durante el scroll. */
  speed?: number;
  /**
   * Si `children` es una capa de fondo que llena un contenedor con
   * `overflow-hidden` (patrón "imagen de fondo enmascarada"), un `y`
   * translate sin más expondría un borde vacío en el extremo opuesto al
   * desplazamiento. `oversize` aplica un `scale(1.1)` vía GSAP — **solo**
   * cuando el parallax realmente corre (desktop + sin reduced-motion) — para
   * dar el margen necesario sin dejar un zoom estático permanente bajo
   * reduced-motion. No usar cuando `children` es el elemento completo que se
   * mueve dentro de su propio flujo (ahí no hay nada que enmascarar).
   */
  oversize?: boolean;
  className?: string;
};

/**
 * Desplaza `children` en `y` proporcional al scroll (`scrub`). Acotado a
 * viewports md+ vía `gsap.matchMedia()` — en mobile no corre (evita jank en
 * dispositivos de gama baja). Reduced-motion → sin transform.
 */
export function Parallax({
  children,
  speed = 0.15,
  oversize = false,
  className,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;
      registerGsap();
      const el = ref.current;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        if (oversize) gsap.set(el, { scale: 1.1 });
        gsap.to(el, {
          y: () => window.innerHeight * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [reducedMotion, speed, oversize] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
