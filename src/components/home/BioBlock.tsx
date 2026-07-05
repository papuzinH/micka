import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Proporciones y offsets replican el Figma (Group 13, 2413:248): la foto 1 es
// la más grande (~4:3), 2 y 3 más chicas (~5:4) y escalonadas verticalmente.
const SIDE_PHOTOS = [
  { img: "cyclist-duo", ratio: "aspect-[4/3]", grow: "md:flex-[307]", offset: "" },
  {
    img: "cyclist-road",
    ratio: "aspect-[5/4]",
    grow: "md:flex-[210]",
    offset: "md:mt-[61px]",
  },
  {
    img: "cyclist-bw-race",
    ratio: "aspect-[5/4]",
    grow: "md:flex-[212]",
    offset: "md:mt-2",
  },
] as const;

export function BioBlock() {
  const t = useTranslations("home.bio");
  return (
    <section className="mx-auto max-w-360 px-5 py-16 md:px-10">
      <div className="flex flex-col gap-12 md:flex-row md:gap-16">
        {/* Retrato + identidad */}
        <div className="flex items-start gap-5">
          <div className="relative h-[267px] w-[160px] shrink-0 overflow-hidden">
            <Image
              src="/placeholders/cyclist-portrait.jpg"
              alt={t("portraitAlt")}
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
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
        <div className="flex flex-1 flex-col gap-6 text-left md:border-l-2 md:border-brand-violet md:pl-16">
          <h2 className="font-display text-h2 text-brand-white">
            {t("heading")}
          </h2>
          <div className="flex flex-col gap-3 md:flex-row md:items-start">
            {SIDE_PHOTOS.map(({ img, ratio, grow, offset }) => (
              <div
                key={img}
                className={cn(
                  "relative overflow-hidden",
                  ratio,
                  grow,
                  offset
                )}
              >
                <Image
                  src={`/placeholders/${img}.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
