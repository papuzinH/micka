import { useTranslations } from "next-intl";

/**
 * Cinta de texto del Home. En Stage 2 es estática (texto repetido); el
 * desplazamiento infinito con GSAP llega en Stage 3. Las copias extra van
 * `aria-hidden` para no repetir el texto a lectores de pantalla.
 */
export function Marquee() {
  const t = useTranslations("home.marquee");
  const text = t("text");
  return (
    <div className="overflow-hidden bg-brand-violet py-3">
      <div className="flex w-max whitespace-nowrap">
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            aria-hidden={i > 0}
            className="px-4 font-display text-card font-bold text-brand-black"
          >
            {text}
            <span className="px-4">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
