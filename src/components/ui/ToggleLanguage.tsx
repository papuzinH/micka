"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "@/lib/i18n/routing";
import { gsap, registerGsap } from "@/lib/motion/register";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import { cn } from "@/lib/cn";

type Locale = "en" | "fr";

const FLAG: Record<Locale, string> = {
  en: "/flags/en.png",
  fr: "/flags/fr.png",
};
const LABEL: Record<Locale, string> = { en: "EN", fr: "FR" };

// Única fuente de verdad de las medidas del switch: el recorrido horizontal
// y el centrado vertical del thumb se derivan de estos cuatro valores en vez
// de escribirse a mano, para que nunca queden desincronizados entre sí (p.
// ej. si el thumb cambia de tamaño, el recorrido se recalcula solo).
const TRACK_W = 80; // px — w-20
const TRACK_H = 36; // px — h-9
const PAD = 4; // px — p-1 (inset de la pista)
const THUMB = 24; // px — size-6 (círculo con la bandera)
const THUMB_TOP = (TRACK_H - THUMB) / 2;
const THUMB_TRAVEL = TRACK_W - PAD * 2 - THUMB;

/**
 * Switch EN/FR: el thumb es directamente la bandera del idioma activo y se
 * desliza del todo hacia la izquierda (EN) o hacia la derecha (FR); el
 * código del idioma se lee en el espacio restante de la pista, del lado
 * opuesto al thumb. Nunca se ven ambos estados a la vez. El locale activo se
 * pasa por prop (el Navbar lo conoce desde los params) para mantenerlo
 * testeable.
 *
 * Al togglear, el thumb se "hunde" (press) y desliza con un pequeño overshoot
 * (spring sobrio); la bandera + el código cambian al idioma destino al cruzar
 * el medio del recorrido y recién al terminar la animación se navega. La
 * animación corre sobre el elemento vivo en el click (no depende de si el
 * componente se remonta al cambiar de ruta) y bajo `prefers-reduced-motion`
 * se saltea: la navegación es instantánea.
 */
export function ToggleLanguage({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const other: Locale = locale === "en" ? "fr" : "en";
  const checked = locale === "fr";

  // Durante la animación mostramos ya la bandera/código del idioma destino (se
  // cambian al cruzar el medio del recorrido), sin esperar la navegación. La
  // posición del thumb la maneja GSAP; su `transform` inline sigue atado al
  // locale REAL (no cambia durante la animación) para no pelear con GSAP.
  const [previewLocale, setPreviewLocale] = useState<Locale | null>(null);

  // Reset del preview cuando el locale real ya cambió — patrón oficial de React
  // "ajustar estado durante el render" (no un effect), para que una instancia
  // que quedó con un preview viejo (p. ej. la del otro breakpoint) se
  // resincronice sin un setState dentro de useEffect.
  const [trackedLocale, setTrackedLocale] = useState(locale);
  if (trackedLocale !== locale) {
    setTrackedLocale(locale);
    setPreviewLocale(null);
  }

  const displayed = previewLocale ?? locale;
  const displayedChecked = displayed === "fr";

  const thumbRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const animatingRef = useRef(false);

  // Mata el timeline si el switch se desmonta a mitad de la animación.
  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  const handleToggle = () => {
    const go = () => router.replace(pathname, { locale: other });
    if (reducedMotion || !thumbRef.current) {
      go();
      return;
    }
    if (animatingRef.current) return;
    animatingRef.current = true;
    registerGsap();

    const targetX = other === "fr" ? THUMB_TRAVEL : 0;
    const thumb = thumbRef.current;
    timelineRef.current?.kill();
    timelineRef.current = gsap
      .timeline({
        onComplete: () => {
          animatingRef.current = false;
          go();
        },
      })
      // Press: el thumb se hunde apenas.
      .to(thumb, { scale: 0.82, duration: 0.1, ease: "power2.in" }, 0)
      // Slide con overshoot (spring sobrio).
      .to(thumb, { x: targetX, duration: 0.4, ease: "back.out(1.7)" }, 0.05)
      // Al cruzar el medio del recorrido, bandera + código pasan al destino.
      .add(() => setPreviewLocale(other), 0.25)
      // Suelta el press.
      .to(thumb, { scale: 1, duration: 0.18, ease: "power2.out" }, 0.28);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      aria-label={`Switch language to ${LABEL[other]}`}
      className={cn(
        "relative inline-flex h-9 w-20 items-center rounded-full bg-brand-gray p-1",
        "shadow-[inset_-4px_4px_4px_-1px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      <span
        ref={thumbRef}
        aria-hidden="true"
        style={{
          top: THUMB_TOP,
          transform: checked ? `translateX(${THUMB_TRAVEL}px)` : undefined,
        }}
        className="absolute left-1 size-6 overflow-hidden rounded-full"
      >
        <Image
          src={FLAG[displayed]}
          alt=""
          fill
          sizes={`${THUMB}px`}
          className="scale-150 object-cover"
        />
      </span>
      <span
        className={cn(
          "flex w-full font-body text-body-semibold text-white",
          displayedChecked ? "justify-start pl-2 pr-9" : "justify-end pl-9 pr-2"
        )}
      >
        {LABEL[displayed]}
      </span>
    </button>
  );
}
