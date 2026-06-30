import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/site/PageHeader";
import { getCollabs, localized } from "@/lib/pocketbase/queries";
import { fileUrl } from "@/lib/pocketbase/files";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collabs" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function CollabsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("collabs");
  const collabs = await getCollabs();

  return (
    <main className="pb-20">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-360 px-5 md:px-10">
        {collabs.length === 0 ? (
          <p className="font-body text-brand-white/60">{t("empty")}</p>
        ) : (
          <div className="grid gap-px bg-brand-light-gray sm:grid-cols-2 lg:grid-cols-3">
            {collabs.map((c) => {
              const logo = fileUrl(
                { collectionName: "collabs", id: c.id },
                c.logo,
                { thumb: "400x0" },
              );
              return (
                <article
                  key={c.id}
                  className="flex flex-col bg-brand-black p-8"
                >
                  <div className="flex h-16 items-center">
                    {logo ? (
                      <Image
                        src={logo}
                        alt={c.name}
                        width={160}
                        height={64}
                        className="max-h-16 w-auto object-contain"
                      />
                    ) : (
                      <p className="font-display text-h2 text-brand-white">
                        {c.name}
                      </p>
                    )}
                  </div>
                  <p className="mt-4 font-body text-sm leading-relaxed text-brand-white/60">
                    {localized(c, "description", locale)}
                  </p>
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 font-display text-h4 uppercase text-brand-violet transition-colors hover:text-brand-white"
                    >
                      {t("visit")} <span aria-hidden="true">→</span>
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
