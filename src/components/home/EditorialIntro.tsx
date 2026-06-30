import Image from "next/image";
import { useTranslations } from "next-intl";

/** Bloque editorial de 4 columnas: texto · imagen · texto (Core Focus) · imagen.
 *  En 2b los textos saldrán de `site_content`; por ahora vienen de i18n. */
export function EditorialIntro() {
  const t = useTranslations("home.editorial");
  return (
    <section className="bg-brand-gray">
      <div className="mx-auto grid max-w-360 items-center gap-6 px-5 py-16 md:grid-cols-4 md:px-10">
        <p className="text-body text-brand-white/80">{t("intro")}</p>
        <div className="relative h-44 overflow-hidden md:h-full md:min-h-44">
          <Image
            src="/placeholders/cyclist-duo.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 325px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-h3 text-brand-violet">
            {t("focusTitle")}
          </h3>
          <p className="text-body text-brand-white/80">{t("focus")}</p>
        </div>
        <div className="relative h-44 overflow-hidden md:h-full md:min-h-44">
          <Image
            src="/placeholders/cyclist-bw-race.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 325px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
