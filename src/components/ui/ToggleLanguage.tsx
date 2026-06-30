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

/**
 * Toggle EN/FR del UI Kit. Muestra el idioma actual (código + bandera) y al
 * pulsar cambia al otro locale preservando la ruta. El locale activo se pasa
 * por prop (el Navbar lo conoce desde los params) para mantenerlo testeable.
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

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: other })}
      aria-label={`Switch language to ${LABEL[other]}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-[10px] bg-brand-gray px-2.5 py-[3px]",
        "font-body text-body-semibold text-white",
        "shadow-[inset_-4px_4px_4px_-1px_rgba(0,0,0,0.25)] transition-colors hover:bg-brand-gray-light",
        className
      )}
    >
      <span>{LABEL[locale]}</span>
      <Image
        src={FLAG[locale]}
        alt=""
        width={14}
        height={14}
        className="size-3.5 rounded-full object-cover"
      />
    </button>
  );
}
