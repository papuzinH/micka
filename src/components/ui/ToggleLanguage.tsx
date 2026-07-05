"use client";

import Image from "next/image";
import { usePathname, useRouter } from "@/lib/i18n/routing";
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
  const other: Locale = locale === "en" ? "fr" : "en";
  const checked = locale === "fr";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => router.replace(pathname, { locale: other })}
      aria-label={`Switch language to ${LABEL[other]}`}
      className={cn(
        "relative inline-flex h-9 w-20 items-center rounded-full bg-brand-gray p-1",
        "shadow-[inset_-4px_4px_4px_-1px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      <span
        aria-hidden="true"
        style={{
          top: THUMB_TOP,
          transform: checked ? `translateX(${THUMB_TRAVEL}px)` : undefined,
        }}
        className="absolute left-1 size-6 overflow-hidden rounded-full transition-transform duration-200 motion-reduce:transition-none"
      >
        <Image
          src={FLAG[locale]}
          alt=""
          fill
          sizes={`${THUMB}px`}
          className="scale-150 object-cover"
        />
      </span>
      <span
        className={cn(
          "flex w-full font-body text-body-semibold text-white",
          checked ? "justify-start pl-2 pr-9" : "justify-end pl-9 pr-2"
        )}
      >
        {LABEL[locale]}
      </span>
    </button>
  );
}
