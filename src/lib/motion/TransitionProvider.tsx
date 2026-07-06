"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
// Router/pathname *nativos* de Next (no los de next-intl): los hrefs que
// interceptamos vienen del atributo `href` del DOM, que next-intl's `Link`
// ya resolvió con el prefijo de locale incluido (ej. "/en/portfolio"). El
// router de next-intl asume que le pasás una ruta *sin* locale y se lo
// vuelve a anteponer — pasarle un href ya prefijado duplicaba el locale
// (quedaba "/en/en/portfolio").
import { useRouter, usePathname } from "next/navigation";
import { gsap, registerGsap } from "./register";
import { useReducedMotion } from "./useReducedMotion";
import { useMotionSettings } from "./MotionProvider";

const COVER_DURATION = 0.55;
const REVEAL_DURATION = 0.6;
// Tiempo que la cortina queda totalmente cubriendo la pantalla antes de
// descubrir la página nueva — suficiente para que el wordmark se lea.
const HOLD_DURATION = 0.5;

function isModifiedOrNonPrimaryClick(event: MouseEvent): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

/** Resuelve un link interno navegable a interceptar, o `null` si debe dejarse al comportamiento nativo. */
function resolveInternalHref(anchor: HTMLAnchorElement): string | null {
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;

  const href = anchor.getAttribute("href");
  if (!href) return null;
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return null; // mismo lugar (solo cambia el hash) — comportamiento nativo
  }

  return url.pathname + url.search + url.hash;
}

/**
 * Cortina de transición entre rutas del sitio público: intercepta clicks en
 * links internos (delegación de eventos sobre `document` — no requiere
 * envolver cada `Link`/`Button` con un componente especial), cubre la
 * pantalla con GSAP y recién entonces navega; al montar la página nueva
 * (detectado vía cambio de `pathname` — este provider vive en el layout de
 * `(site)` y no se remonta entre rutas) descubre la cortina.
 *
 * Fallback firme: bajo `prefers-reduced-motion` la navegación es instantánea
 * (`router.push` directo) y la cortina nunca se muestra — ni el listener de
 * click intercepta nada, así que el comportamiento nativo (incl. abrir en
 * pestaña nueva, mid-click, etc.) queda intacto.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const { lenisRef } = useMotionSettings();
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const pendingHref = useRef<string | null>(null);
  const previousPathname = useRef(pathname);
  // La cortina está cubriendo la pantalla (cover completo). Solo entonces la
  // fase de descubrir (reveal) debe correr — así una navegación que no pasó por
  // navigate() (back/forward del navegador) no dispara un flash de cortina.
  const isCoveringRef = useRef(false);

  const navigate = useCallback(
    (href: string) => {
      if (reducedMotion || !curtainRef.current) {
        router.push(href);
        return;
      }
      registerGsap();
      pendingHref.current = href;
      gsap.killTweensOf(curtainRef.current);
      gsap.set(curtainRef.current, { pointerEvents: "auto", autoAlpha: 1 });
      // Fase 1 (cover): la cortina sube desde abajo hasta cubrir toda la
      // pantalla. `fromTo` fuerza el arranque en yPercent:100 (fuera de
      // pantalla, abajo) sin depender del estado previo — así el cover siempre
      // es visible. Recién cuando terminó de cubrir (y no antes) navegamos, así
      // la página nueva se monta *detrás* de la cortina y nunca se ve sin cubrir.
      gsap.fromTo(
        curtainRef.current,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: COVER_DURATION,
          ease: "power3.inOut",
          onComplete: () => {
            isCoveringRef.current = true;
            if (pendingHref.current) router.push(pendingHref.current);
          },
        }
      );
    },
    [reducedMotion, router]
  );

  // Sincroniza el estado interno de GSAP con la posición "fuera de pantalla"
  // que ya viene por el `transform` inline — si no, GSAP asumiría yPercent:0
  // como punto de partida y el primer `.to({yPercent:0})` sería un no-op.
  useEffect(() => {
    if (reducedMotion || !curtainRef.current) return;
    registerGsap();
    // GSAP toma control total del transform desde cero (el markup NO trae
    // ningún transform pre-aplicado — ver nota en el JSX). yPercent:100 la
    // manda fuera de pantalla (abajo); autoAlpha:1 la hace opaca (el base es
    // opacity-0 para el fallback sin-JS / reduced-motion).
    gsap.set(curtainRef.current, { yPercent: 100, autoAlpha: 1 });
  }, [reducedMotion]);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    pendingHref.current = null;
    lenisRef.current?.scrollTo(0, { immediate: true });

    if (reducedMotion || !curtainRef.current) return;
    // Solo descubrimos si veníamos de un cover (click interceptado). Un
    // back/forward del navegador cambia el pathname sin haber cubierto: en ese
    // caso no hay nada que descubrir y forzar la cortina sería un flash.
    if (!isCoveringRef.current) return;
    isCoveringRef.current = false;

    registerGsap();
    gsap.killTweensOf(curtainRef.current);
    // Fase 2 (reveal): garantiza cobertura total (la página nueva ya montó
    // detrás), esperá HOLD para que el wordmark se lea, y recién ahí la cortina
    // sale por arriba dejando ver la página.
    gsap.set(curtainRef.current, { yPercent: 0, pointerEvents: "auto" });
    gsap.to(curtainRef.current, {
      yPercent: -100,
      duration: REVEAL_DURATION,
      delay: HOLD_DURATION,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(curtainRef.current, { yPercent: 100, pointerEvents: "none" });
      },
    });
    // lenisRef es un ref estable (no dispara re-render); no hace falta listarlo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, reducedMotion]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedOrNonPrimaryClick(event)) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = resolveInternalHref(anchor);
      if (!href) return;

      // preventDefault (sin stopPropagation): next/link chequea
      // `e.defaultPrevented` antes de hacer su propia navegación (confirmado
      // en node_modules/next/dist/client/link.js) y aborta si ya está en
      // true — por eso alcanza con esto para que no navegue por su cuenta.
      // stopPropagation() rompería cualquier otro onClick de React en el
      // link o sus ancestros (ej. el overlay del menú mobile del Navbar, que
      // cierra el menú al bubblear un click desde un link interno) porque
      // React delega los eventos y no vuelve a dispararlos si la propagación
      // nativa se corta antes de llegar a su listener raíz.
      event.preventDefault();
      navigate(href);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [navigate]);

  return (
    <>
      {/*
        La cortina NO lleva ningún `transform` ni utilidad translate en el
        markup: GSAP maneja el transform (yPercent) desde cero. Si el elemento
        trajera un translateY previo (inline o la clase `translate-y-full` de
        Tailwind v4), GSAP lo parsea como `y` en px y le SUMA el yPercent
        encima → quedaba el doble (200% al arrancar, 100% al "cubrir"), así que
        el cover nunca cubría y solo el reveal barría un instante. El estado
        oculto de fallback (sin JS / bajo reduced-motion, donde GSAP no corre)
        se hace con `opacity-0`, independiente del transform que anima GSAP.
      */}
      <div
        ref={curtainRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-100 flex items-center justify-center bg-brand-violet opacity-0"
      >
        {/*
          Wordmark del navbar (lockup de 2 líneas, Syne ExtraBold uppercase).
          En el navbar "Don Micka" va en violeta, pero acá el fondo ES violeta
          → ambas líneas en blanco para que sea legible sobre la cortina.
        */}
        <div className="text-center font-display text-h2 font-extrabold uppercase leading-[1.05] text-brand-white">
          <span className="block">Don Micka</span>
          <span className="block">de la Vega</span>
        </div>
      </div>
      {children}
    </>
  );
}
