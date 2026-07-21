import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Reveal } from "@/lib/motion/Reveal";
import { SplitReveal } from "@/lib/motion/SplitReveal";
import { Parallax } from "@/lib/motion/Parallax";
import { GrowLine } from "@/lib/motion/GrowLine";

// Proporciones y offsets replican el Figma (Group 13, 2413:248): la foto 1 es
// la más grande (~4:3), 2 y 3 más chicas (~5:4) y escalonadas verticalmente.
// `depth` da profundidades de parallax distintas por foto (efecto de tira).
const SIDE_PHOTOS = [
  {
    img: "cyclist-duo",
    ratio: "aspect-[4/3]",
    grow: "md:flex-[307]",
    offset: "",
    depth: 0.04,
  },
  {
    img: "cyclist-road",
    ratio: "aspect-[5/4]",
    grow: "md:flex-[210]",
    offset: "md:mt-[61px]",
    depth: 0.08,
  },
  {
    img: "cyclist-bw-race",
    ratio: "aspect-[5/4]",
    grow: "md:flex-[212]",
    offset: "md:mt-2",
    depth: 0.12,
  },
] as const;

export function BioBlock() {
  const t = useTranslations("home.bio");
  return (
    <section className="mx-auto max-w-360 px-5 py-16 md:px-10">
      <div className="flex flex-col gap-12 md:flex-row md:gap-16">
        {/* Retrato + identidad */}
        <div className="flex items-start gap-5">
          <Reveal
            from={{ opacity: 0, scale: 0.94 }}
            duration={0.9}
            className="relative h-[220px] w-[132px] shrink-0 overflow-hidden sm:h-[267px] sm:w-[160px]"
          >
            <Image
              src="/placeholders/cyclist-portrait.jpg"
              alt={t("portraitAlt")}
              fill
              sizes="160px"
              className="object-cover"
            />
          </Reveal>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-display text-card text-brand-violet">
                {t("name")}
              </h2>
              <p className="text-body text-brand-white/70">{t("role")}</p>
            </div>
            <Button href="/about" size="sm">
              {t("about")}
            </Button>
          </div>
        </div>

        {/* Heading editorial + tira de fotos */}
        <div className="relative flex flex-1 flex-col gap-6 text-left md:pl-16">
          {/* Divisor violeta: "se dibuja" de arriba a abajo. */}
          <GrowLine className="absolute inset-y-0 left-0 hidden w-0.5 origin-top bg-brand-violet md:block" />
          <SplitReveal
            as="h2"
            type="lines"
            className="font-display text-h2 text-brand-white"
          >
            {t("heading")}
          </SplitReveal>
          <div className="flex flex-col gap-3 md:flex-row md:items-start">
            {SIDE_PHOTOS.map(({ img, ratio, grow, offset, depth }) => (
              <Parallax
                key={img}
                speed={depth}
                className={cn("relative overflow-hidden", ratio, grow, offset)}
              >
                <Image
                  src={`/placeholders/${img}.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                />
              </Parallax>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
