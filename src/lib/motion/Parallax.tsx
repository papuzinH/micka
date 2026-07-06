"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "./register";
import { useReducedMotion } from "./useReducedMotion";

type ParallaxProps = {
  children: ReactNode;
  /** Fracción de la altura de viewport que se desplaza `children` durante el scroll. */
  speed?: number;
  className?: string;
};

/**
 * Desplaza `children` en `y` proporcional al scroll (`scrub`). Acotado a
 * viewports md+ vía `gsap.matchMedia()` — en mobile no corre (evita jank en
 * dispositivos de gama baja). Reduced-motion → sin transform.
 */
export function Parallax({ children, speed = 0.15, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;
      registerGsap();
      const el = ref.current;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
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
    { scope: ref, dependencies: [reducedMotion, speed] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
