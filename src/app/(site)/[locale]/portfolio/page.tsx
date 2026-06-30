import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/site/PageHeader";
import { AlbumCard } from "@/components/site/AlbumCard";
import { getCategories, getAlbums, localized } from "@/lib/pocketbase/queries";
import { fileUrl } from "@/lib/pocketbase/files";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portfolio");

  const [categories, albums] = await Promise.all([
    getCategories(),
    getAlbums(),
  ]);

  const groups = categories
    .map((c) => ({ category: c, items: albums.filter((a) => a.category === c.id) }))
    .filter((g) => g.items.length > 0);
  const uncategorized = albums.filter(
    (a) => !categories.some((c) => c.id === a.category),
  );

  const toCard = (a: (typeof albums)[number]) => (
    <AlbumCard
      key={a.id}
      href={`/portfolio/${a.slug}`}
      src={fileUrl({ collectionName: "albums", id: a.id }, a.cover, {
        thumb: "600x0",
      })}
      alt={localized(a, "title", locale)}
      title={localized(a, "title", locale)}
      meta={a.date ? new Date(a.date).getFullYear().toString() : undefined}
    />
  );

  return (
    <main className="pb-20">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-360 px-5 md:px-10">
        {albums.length === 0 && (
          <p className="font-body text-brand-white/60">{t("empty")}</p>
        )}

        {groups.map(({ category, items }) => (
          <section key={category.id} className="mt-14 first:mt-0">
            <h2 className="mb-6 font-display text-h2 text-brand-white">
              {localized(category, "name", locale)}
            </h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {items.map(toCard)}
            </div>
          </section>
        ))}

        {uncategorized.length > 0 && (
          <section className="mt-14">
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {uncategorized.map(toCard)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
