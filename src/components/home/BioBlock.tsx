import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

const SIDE_PHOTOS = ["cyclist-duo", "cyclist-road", "cyclist-bw-race"] as const;

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
        <div className="flex flex-1 flex-col gap-6 md:border-l md:border-white/15 md:pl-16">
          <h2 className="font-display text-h2 text-brand-white">
            {t("heading")}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {SIDE_PHOTOS.map((img) => (
              <div
                key={img}
                className="relative aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={`/placeholders/${img}.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 33vw, 220px"
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
