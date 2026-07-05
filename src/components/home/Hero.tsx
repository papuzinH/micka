import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const t = useTranslations("home.hero");
  return (
    <section className="relative flex min-h-128 items-center overflow-hidden">
      <Image
        src="/placeholders/cyclist-road.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="relative mx-auto flex w-full max-w-360 flex-col items-center px-5 py-16 text-center md:items-end md:px-10 md:text-right">
        {/* items-stretch: el ancho de este bloque lo define el hijo más ancho
            (el título) y el subtítulo + los botones se estiran (w-full) para
            igualarlo — funciona en EN y FR sin medidas fijas. */}
        <div className="inline-flex w-full flex-col items-stretch gap-6 md:w-auto">
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[1.05] md:text-6xl">
            <span className="block text-brand-violet">Don Micka</span>
            <span className="block text-brand-white">de la Vega</span>
          </h1>
          <p className="bg-white/40 px-6 py-4 text-center font-display text-h3 text-brand-violet-dark backdrop-blur-md md:py-5">
            {t("tagline")}
          </p>
          <div className="flex gap-4">
            <Button href="/portfolio" size="xl" iconRight={null} className="flex-1">
              {t("ctaExplore")}
            </Button>
            <Button href="/collabs" size="xl" iconRight={null} className="flex-1">
              {t("ctaCollaborate")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
