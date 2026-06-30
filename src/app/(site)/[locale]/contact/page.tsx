import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/site/PageHeader";
import { ContactForm } from "@/components/site/ContactForm";
import { getSiteContent, localized } from "@/lib/pocketbase/queries";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const content = await getSiteContent();
  const intro = content.contact_intro
    ? localized(content.contact_intro, "value", locale)
    : t("subtitle");

  return (
    <main className="pb-20">
      <PageHeader title={t("title")} subtitle={intro} />
      <div className="mx-auto max-w-2xl px-5 md:px-10">
        <ContactForm />
      </div>
    </main>
  );
}
