"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "./register";
import { useReducedMotion } from "./useReducedMotion";
import { DEFAULT_REVEAL_FROM, restingVarsFor, type RevealFrom } from "./from";

export type { RevealFrom };

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  from?: RevealFrom;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
};

/**
 * Revela `children` (opacity/x/y) al entrar en viewport. El estado inicial
 * oculto se aplica con `gsap.set` dentro de `useGSAP` (JS), nunca desde el
 * markup/CSS: si el JS no corre, el contenido queda visible tal cual se
 * renderizó. Bajo `prefers-reduced-motion` no se oculta ni anima nada.
 */
export function Reveal({
  as: Component = "div",
  children,
  from = DEFAULT_REVEAL_FROM,
  delay = 0,
  duration = 0.8,
  once = true,
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;
      registerGsap();
      const el = ref.current;
      gsap.set(el, from);
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once,
        onEnter: () =>
          gsap.to(el, {
            ...restingVarsFor(from),
            duration,
            delay,
            ease: "power3.out",
          }),
      });
    },
    { scope: ref, dependencies: [reducedMotion] }
  );

  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
