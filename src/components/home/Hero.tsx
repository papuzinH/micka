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
      <div className="absolute inset-0 bg-linear-to-r from-brand-black/80 via-brand-black/50 to-brand-black/30" />

      <div className="relative mx-auto flex w-full max-w-360 flex-col items-center gap-6 px-5 py-16 text-center md:items-end md:px-10 md:text-right">
        <h1 className="font-display text-4xl font-extrabold uppercase leading-[1.05] md:text-6xl">
          <span className="block text-brand-violet">Don Micka</span>
          <span className="block text-brand-white">de la Vega</span>
        </h1>
        <p className="rounded-[10px] bg-brand-gray-bg/90 px-6 py-3 font-display text-sm text-brand-white md:text-base">
          {t("tagline")}
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:justify-end">
          <Button href="/portfolio" size="xl">
            {t("ctaExplore")}
          </Button>
          <Button href="/collabs" size="xl">
            {t("ctaCollaborate")}
          </Button>
        </div>
      </div>
    </section>
  );
}
