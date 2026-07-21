import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` en el cliente (aplica estados iniciales de animación antes
 * del paint, sin flash de un frame), `useEffect` en el server (evita el warning
 * de React "useLayoutEffect does nothing on the server"). Patrón estándar para
 * animaciones que montan un nodo y lo revelan imperativamente.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
