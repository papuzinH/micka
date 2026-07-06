"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsap } from "./register";
import { useReducedMotion } from "./useReducedMotion";

type MarqueeProps = {
  /** Contenido ya duplicado (2 copias) por quien lo use — este primitive solo anima el desplazamiento. */
  children: ReactNode;
  /** Multiplicador de velocidad relativo a una duración base de 20s por loop. */
  speed?: number;
  direction?: "left" | "right";
  className?: string;
};

/**
 * Cinta horizontal en loop infinito y seamless: anima `xPercent` de 0 a
 * ±50% (asumiendo el contenido duplicado x2, típico de un marquee) y repite
 * indefinidamente — al duplicarse el contenido, el salto de -50% a 0% es
 * visualmente idéntico. Estática bajo `prefers-reduced-motion`.
 */
export function Marquee({
  children,
  speed = 1,
  direction = "left",
  className,
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;
      registerGsap();

      const baseDurationSeconds = 20 / speed;
      gsap.to(ref.current, {
        xPercent: direction === "left" ? -50 : 50,
        duration: baseDurationSeconds,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: ref, dependencies: [reducedMotion, speed, direction] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
