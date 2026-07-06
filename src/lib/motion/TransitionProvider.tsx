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
const REVEAL_DURATION = 0.55;
// Tiempo que la cortina queda totalmente cubriendo la pantalla antes de
// descubrir la página nueva — suficiente para que el wordmark se lea.
const HOLD_DURATION = 0.45;

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
      gsap.set(curtainRef.current, { pointerEvents: "auto" });
      // Fase 1 (cover): la cortina sube desde abajo hasta cubrir toda la
      // pantalla. Recién cuando terminó de cubrir (y no antes) navegamos, así la
      // página nueva se monta *detrás* de la cortina y nunca se ve sin cubrir.
      gsap.to(curtainRef.current, {
        yPercent: 0,
        duration: COVER_DURATION,
        ease: "power3.inOut",
        onComplete: () => {
          isCoveringRef.current = true;
          if (pendingHref.current) router.push(pendingHref.current);
        },
      });
    },
    [reducedMotion, router]
  );

  // Sincroniza el estado interno de GSAP con la posición "fuera de pantalla"
  // que ya viene por el `transform` inline — si no, GSAP asumiría yPercent:0
  // como punto de partida y el primer `.to({yPercent:0})` sería un no-op.
  useEffect(() => {
    if (reducedMotion || !curtainRef.current) return;
    registerGsap();
    gsap.set(curtainRef.current, { yPercent: 100 });
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
        Estado oculto inicial vía `transform` inline (NO la clase Tailwind
        `translate-y-full`): en Tailwind v4 las utilidades translate usan la
        propiedad CSS `translate`, independiente de `transform`. GSAP anima
        `transform` (yPercent), así que ambas se *componían* y la cortina
        quedaba corrida 100% de más — el "cover" no se veía y el "reveal"
        terminaba tapando la pantalla (el flash que aparecía). Con `transform`
        inline GSAP lo sobrescribe limpio; y si el JS no corre (o bajo
        reduced-motion) la cortina queda fuera de pantalla igual.
      */}
      <div
        ref={curtainRef}
        aria-hidden="true"
        style={{ transform: "translateY(100%)" }}
        className="pointer-events-none fixed inset-0 z-100 flex items-center justify-center bg-brand-violet"
      >
        <span className="font-display text-h2 uppercase tracking-widest text-brand-white">
          Micka&apos;s / Photos
        </span>
      </div>
      {children}
    </>
  );
}
