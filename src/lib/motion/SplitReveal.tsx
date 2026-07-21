"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText, registerGsap } from "./register";
import { useReducedMotion } from "./useReducedMotion";

type SplitUnit = "lines" | "words" | "chars";

type SplitRevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  type?: SplitUnit;
  stagger?: number;
  duration?: number;
  delay?: number;
  once?: boolean;
  /**
   * Envolver cada unidad en una máscara `overflow:hidden` (emerge de detrás de
   * una línea invisible). `true` por default. Ponelo en `false` para textos que
   * ocupan casi todo el ancho disponible: la máscara mide su ancho al partir el
   * texto, y si eso ocurre antes de que la webfont aplique su métrica real,
   * recorta el sobrante horizontal (ej. un título de una palabra larga).
   */
  mask?: boolean;
};

/**
 * Parte el texto (`SplitText`) y revela cada unidad (línea/palabra/caracter)
 * en cascada al entrar en viewport. Bajo `prefers-reduced-motion` NO se
 * parte el texto: queda el nodo original, plano y accesible. `SplitText`
 * siempre se revierte en el cleanup de `useGSAP` para no dejar el DOM
 * partido para lectores de pantalla si el componente se desmonta.
 */
export function SplitReveal({
  as: Component = "div",
  children,
  className,
  type = "lines",
  stagger = 0.08,
  duration = 0.7,
  delay = 0,
  once = true,
  mask = true,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;
      registerGsap();

      const split = new SplitText(
        ref.current,
        mask ? { type, mask: type } : { type },
      );
      const targets = split[type];
      if (!targets?.length) return;

      gsap.set(targets, { yPercent: 100, opacity: 0 });
      const trigger = ScrollTrigger.create({
        trigger: ref.current,
        start: "top 85%",
        once,
        onEnter: () =>
          gsap.to(targets, {
            yPercent: 0,
            opacity: 1,
            duration,
            delay,
            stagger,
            ease: "power3.out",
          }),
      });

      return () => {
        trigger.kill();
        split.revert();
      };
    },
    { scope: ref, dependencies: [reducedMotion] }
  );

  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
