import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/site/PageHeader";
import { StaggerGroup } from "@/lib/motion/StaggerGroup";
import { getReviews, localized } from "@/lib/pocketbase/queries";
import { fileUrl } from "@/lib/pocketbase/files";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reviews");
  const reviews = await getReviews();

  return (
    <main className="pb-20">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-360 px-5 md:px-10">
        {reviews.length === 0 ? (
          <p className="font-body text-brand-white/60">{t("empty")}</p>
        ) : (
          <StaggerGroup
            className="grid gap-6 md:grid-cols-2"
            from={{ opacity: 0, y: 24 }}
          >
            {reviews.map((r) => {
              const avatar = fileUrl(
                { collectionName: "reviews", id: r.id },
                r.avatar,
                { thumb: "200x200" },
              );
              return (
                <article
                  key={r.id}
                  className="flex flex-col gap-6 border-l-2 border-brand-violet bg-brand-gray-bg p-6 md:p-8"
                >
                  <blockquote className="font-body text-lg leading-relaxed text-brand-white/90">
                    “{localized(r, "quote", locale)}”
                  </blockquote>
                  <div className="mt-auto flex items-center gap-4">
                    {avatar && (
                      <Image
                        src={avatar}
                        alt={r.author}
                        width={48}
                        height={48}
                        className="size-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-display text-card uppercase text-brand-white">
                        {r.author}
                      </p>
                      {r.role && (
                        <p className="font-body text-sm text-brand-white/50">
                          {r.role}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </StaggerGroup>
        )}
      </div>
    </main>
  );
}
