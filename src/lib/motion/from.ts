export type RevealFrom = { x?: number; y?: number; opacity?: number; scale?: number };

export const DEFAULT_REVEAL_FROM: RevealFrom = { y: 40, opacity: 0 };

/** Vars de reposo (destino) para las props presentes en `from`: x/y vuelven a 0, opacity/scale a 1. */
export function restingVarsFor(from: RevealFrom): RevealFrom {
  const to: RevealFrom = {};
  if (from.x !== undefined) to.x = 0;
  if (from.y !== undefined) to.y = 0;
  if (from.opacity !== undefined) to.opacity = 1;
  if (from.scale !== undefined) to.scale = 1;
  return to;
}
