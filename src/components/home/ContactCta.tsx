import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/lib/motion/Reveal";
import { GrowLine } from "@/lib/motion/GrowLine";

/** CTA de cierre del Home: "Brands. Teams. Athletes." + invitación a contacto. */
export function ContactCta() {
  const t = useTranslations("home.cta");
  return (
    <section className="mx-auto max-w-360 px-5 pb-20 pt-16 text-center md:px-10">
      <GrowLine
        axis="x"
        className="mx-auto mb-16 h-0.5 w-full max-w-235 origin-center bg-brand-violet"
      />
      <Reveal
        as="h2"
        className="font-display text-3xl font-extrabold uppercase leading-tight text-brand-white md:text-5xl"
      >
        {t("title")}
      </Reveal>
      <Reveal
        as="p"
        delay={0.15}
        className="mx-auto mt-5 max-w-md text-body text-brand-white/70"
      >
        {t("subtitle")}
      </Reveal>
      <Reveal
        from={{ opacity: 0, scale: 0.7 }}
        delay={0.3}
        duration={0.6}
        ease="back.out(1.7)"
        className="mt-8 flex justify-center"
      >
        <Button href="/contact">{t("button")}</Button>
      </Reveal>
    </section>
  );
}
