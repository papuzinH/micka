import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link, routing } from "@/lib/i18n/routing";
import { PhotoGrid } from "@/components/site/PhotoGrid";
import { SplitReveal } from "@/lib/motion/SplitReveal";
import { Reveal } from "@/lib/motion/Reveal";
import { pageAlternates } from "@/lib/seo/alternates";
import {
  getAlbums,
  getAlbumBySlug,
  getPhotosByAlbum,
  getCategories,
  localized,
} from "@/lib/pocketbase/queries";
import { fileUrl } from "@/lib/pocketbase/files";

export const revalidate = 300;

function formatDate(date: string, locale: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(d);
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

export async function generateStaticParams() {
  const albums = await getAlbums();
  return routing.locales.flatMap((locale) =>
    albums.map((a) => ({ locale, slug: a.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return {};
  return {
    title: localized(album, "title", locale),
    description: stripHtml(localized(album, "description", locale)).slice(0, 160),
    alternates: pageAlternates(`/portfolio/${slug}`, locale),
  };
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("album");

  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  const [photos, categories] = await Promise.all([
    getPhotosByAlbum(album.id),
    getCategories(),
  ]);
  const category = categories.find((c) => c.id === album.category);
  const description = localized(album, "description", locale);

  const items = photos.map((p) => ({
    src: fileUrl({ collectionName: "photos", id: p.id }, p.image, {
      thumb: "800x0",
    }),
    alt: localized(p, "alt", locale),
    caption: localized(p, "caption", locale) || undefined,
  }));

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-360 px-5 pt-10 md:px-10 md:pt-16">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 font-body text-sm text-brand-white/60 transition-colors hover:text-brand-violet"
        >
          <span aria-hidden="true">←</span> {t("back")}
        </Link>

        <SplitReveal
          as="h1"
          type="lines"
          className="mt-6 font-display text-h1 uppercase leading-none text-brand-white"
        >
          {localized(album, "title", locale)}
        </SplitReveal>

        <Reveal
          as="div"
          delay={0.15}
          className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-brand-white/50"
        >
          {category && (
            <span className="text-brand-violet">
              {localized(category, "name", locale)}
            </span>
          )}
          {album.date && <span>{formatDate(album.date, locale)}</span>}
        </Reveal>

        {description && (
          <Reveal
            delay={0.2}
            className="mt-6 max-w-2xl font-body leading-relaxed text-brand-white/70"
          >
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </Reveal>
        )}

        <div className="mt-10">
          <PhotoGrid photos={items} />
        </div>
      </div>
    </main>
  );
}
