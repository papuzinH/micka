import { useTranslations } from "next-intl";
import { Marquee as AnimatedMarquee } from "@/lib/motion/Marquee";

/**
 * Cinta de texto del Home, ligeramente inclinada (como en el Figma), con
 * desplazamiento horizontal infinito (`AnimatedMarquee`, GSAP). Las copias
 * extra van `aria-hidden` para no repetir el texto a lectores de pantalla;
 * son necesarias para que el loop se vea continuo (y para cubrir pantallas
 * anchas incluso cuando la animación está detenida por reduced-motion).
 */
export function Marquee() {
  const t = useTranslations("home.marquee");
  const text = t("text");
  return (
    <div className="relative overflow-hidden py-8">
      <div className="ml-[-5%] w-[110%] -rotate-2 bg-brand-violet py-3">
        <AnimatedMarquee speed={0.6} className="flex w-max whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              aria-hidden={i > 0}
              className="px-4 font-display text-card font-bold text-brand-white"
            >
              {text}
              <span className="px-4">|</span>
            </span>
          ))}
        </AnimatedMarquee>
      </div>
    </div>
  );
}
