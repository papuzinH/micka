"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, registerGsap } from "./register";
import { useReducedMotion } from "./useReducedMotion";
import { DEFAULT_REVEAL_FROM, restingVarsFor, type RevealFrom } from "./from";

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  /** Selector de los hijos a animar en cascada, relativo al wrapper. */
  childSelector?: string;
  stagger?: number;
  from?: RevealFrom;
  duration?: number;
  delay?: number;
  once?: boolean;
};

/**
 * Anima los hijos directos (o los que matcheen `childSelector`) en cascada al
 * entrar en viewport. Mismas garantías que `Reveal`: el estado oculto se
 * setea desde JS (nunca CSS) y se desactiva bajo `prefers-reduced-motion`.
 */
export function StaggerGroup({
  children,
  className,
  childSelector = ":scope > *",
  stagger = 0.12,
  from = DEFAULT_REVEAL_FROM,
  duration = 0.7,
  delay = 0,
  once = true,
}: StaggerGroupProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;
      registerGsap();
      const targets = ref.current.querySelectorAll(childSelector);
      if (!targets.length) return;
      gsap.set(targets, from);
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 85%",
        once,
        onEnter: () =>
          gsap.to(targets, {
            ...restingVarsFor(from),
            duration,
            delay,
            stagger,
            ease: "power3.out",
          }),
      });
    },
    { scope: ref, dependencies: [reducedMotion] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
