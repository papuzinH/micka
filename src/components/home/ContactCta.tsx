import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

/** CTA de cierre del Home: "Brands. Teams. Athletes." + invitación a contacto. */
export function ContactCta() {
  const t = useTranslations("home.cta");
  return (
    <section className="mx-auto max-w-360 px-5 py-20 text-center md:px-10">
      <h2 className="font-display text-3xl font-extrabold uppercase leading-tight text-brand-white md:text-5xl">
        {t("title")}
      </h2>
      <p className="mx-auto mt-5 max-w-md text-body text-brand-white/70">
        {t("subtitle")}
      </p>
      <div className="mt-8 flex justify-center">
        <Button href="/contact">{t("button")}</Button>
      </div>
    </section>
  );
}
