import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/lib/motion/Reveal";
import { SplitReveal } from "@/lib/motion/SplitReveal";
import { getSiteContent, localized } from "@/lib/pocketbase/queries";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const content = await getSiteContent();
  const intro = content.about_intro
    ? localized(content.about_intro, "value", locale)
    : "";
  const body = content.about_body
    ? localized(content.about_body, "value", locale)
    : "";

  return (
    <main className="pb-20">
      <PageHeader title={t("title")} />
      <div className="mx-auto max-w-360 px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-[2fr_3fr] md:gap-16">
          <Reveal
            from={{ opacity: 0, scale: 0.96 }}
            className="relative aspect-[3/4] w-full overflow-hidden bg-brand-gray"
          >
            <Image
              src="/placeholders/cyclist-portrait.jpg"
              alt={t("role")}
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
            />
          </Reveal>
          <div className="flex flex-col">
            <Reveal as="p" className="font-display text-h3 uppercase text-brand-violet">
              {t("role")}
            </Reveal>
            {intro && (
              <SplitReveal
                as="p"
                type="lines"
                delay={0.1}
                className="mt-4 font-display text-h2 leading-tight text-brand-white"
              >
                {intro}
              </SplitReveal>
            )}
            {body && (
              <Reveal
                as="p"
                delay={0.2}
                className="mt-6 font-body leading-relaxed text-brand-white/70"
              >
                {body}
              </Reveal>
            )}
            <Reveal delay={0.3} className="mt-10">
              <Button href="/contact">{t("cta")}</Button>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}
