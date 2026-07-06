"use client";

import type { ElementType } from "react";
import { Reveal } from "./Reveal";

type GrowLineProps = {
  /** Eje de "dibujo": `y` para una barra vertical (crece de arriba a abajo), `x` para una horizontal. */
  axis?: "x" | "y";
  as?: ElementType;
  className?: string;
  duration?: number;
  delay?: number;
};

/**
 * Barra decorativa (divisor, borde acentuado) que "se dibuja" al entrar en
 * viewport: `scaleX`/`scaleY` desde 0 hasta 1. Fina envoltura sobre `Reveal`
 * — hereda sus mismas garantías de reduced-motion / anti-FOUC. El elemento
 * debe posicionar su propio `transform-origin` vía className (ej. `origin-top`
 * u `origin-left`).
 */
export function GrowLine({
  axis = "y",
  as,
  className,
  duration = 0.9,
  delay = 0,
}: GrowLineProps) {
  const from = axis === "y" ? { scaleY: 0 } : { scaleX: 0 };
  return (
    <Reveal as={as} from={from} duration={duration} delay={delay} className={className}>
      <></>
    </Reveal>
  );
}
