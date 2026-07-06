import Image from "next/image";
import { useTranslations } from "next-intl";
import { Reveal } from "@/lib/motion/Reveal";
import { GrowLine } from "@/lib/motion/GrowLine";

/** Bloque editorial de 4 columnas: caja de texto · imagen · caja de texto
 *  (Core Focus) · imagen. Las cajas de texto llevan fondo gris + borde
 *  izquierdo violeta que "se dibuja" al entrar (la "Line 1" del Figma); las
 *  imágenes van sin fondo. En 2b los textos saldrán de `site_content`; por
 *  ahora vienen de i18n. */
export function EditorialIntro() {
  const t = useTranslations("home.editorial");
  return (
    <section className="mx-auto max-w-360 px-5 py-16 md:px-10">
      <div className="grid items-stretch gap-6 md:grid-cols-4">
        <Reveal className="relative bg-brand-gray-light p-5">
          <GrowLine className="absolute inset-y-0 left-0 w-0.5 origin-top bg-brand-violet" />
          <p className="text-body text-brand-white/80">
            {t("intro")}
            <Reveal
              as="span"
              delay={0.2}
              className="mt-3 block text-brand-violet"
            >
              {t("introAccent")}
            </Reveal>
          </p>
        </Reveal>
        <Reveal
          as="div"
          from={{ opacity: 0, scale: 0.96 }}
          className="relative h-44 overflow-hidden md:h-full md:min-h-44"
        >
          <Image
            src="/placeholders/cyclist-duo.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 325px"
            className="object-cover"
          />
        </Reveal>
        <Reveal delay={0.1} className="relative bg-brand-gray-light p-5">
          <GrowLine className="absolute inset-y-0 left-0 w-0.5 origin-top bg-brand-violet" />
          <h3 className="mb-3 font-display text-h3 text-brand-white">
            {t("focusTitle")}
          </h3>
          <p className="text-body text-brand-white/80">
            {t("focus")}
            <Reveal
              as="span"
              delay={0.3}
              className="mt-3 block text-brand-violet"
            >
              {t("focusAccent")}
            </Reveal>
          </p>
        </Reveal>
        <Reveal
          as="div"
          from={{ opacity: 0, scale: 0.96 }}
          delay={0.1}
          className="relative h-44 overflow-hidden md:h-full md:min-h-44"
        >
          <Image
            src="/placeholders/cyclist-bw-race.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 325px"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
