import Image from "next/image";
import { useTranslations } from "next-intl";
import { Reveal } from "@/lib/motion/Reveal";
import { SplitReveal } from "@/lib/motion/SplitReveal";

/** Bloque editorial "craft": dos pares foto + texto sobre fondo negro. */
export function CraftBlock() {
  const t = useTranslations("home.craft");
  return (
    <section className="mx-auto max-w-360 px-5 py-16 md:px-10">
      <div className="grid items-center gap-6 md:grid-cols-4">
        <Reveal
          from={{ opacity: 0, scale: 0.96 }}
          className="relative h-56 overflow-hidden md:h-full md:min-h-56"
        >
          <Image
            src="/placeholders/cyclist-pack.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 307px"
            className="object-cover"
          />
        </Reveal>
        <SplitReveal as="p" type="lines" className="font-display text-h4 text-brand-white">
          {t("light")}
          <span className="block text-brand-violet-dark">
            {t("lightAccent")}
          </span>
        </SplitReveal>
        <Reveal
          from={{ opacity: 0, scale: 0.96 }}
          delay={0.1}
          className="relative h-56 overflow-hidden md:h-full md:min-h-56"
        >
          <Image
            src="/placeholders/cyclist-portrait.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 309px"
            className="object-cover"
          />
        </Reveal>
        <SplitReveal
          as="p"
          type="lines"
          delay={0.1}
          className="font-display text-h4 text-brand-white"
        >
          {t("standard")}
          <span className="block text-brand-violet-dark">
            {t("standardAccent")}
          </span>
        </SplitReveal>
      </div>
    </section>
  );
}
