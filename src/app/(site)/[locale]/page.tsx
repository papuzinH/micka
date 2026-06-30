import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { BioBlock } from "@/components/home/BioBlock";
import { Marquee } from "@/components/home/Marquee";
import { EditorialIntro } from "@/components/home/EditorialIntro";
import {
  StarredAlbums,
  type StarredAlbumItem,
} from "@/components/home/StarredAlbums";
import { FavesGallery, type FaveItem } from "@/components/home/FavesGallery";
import { CraftBlock } from "@/components/home/CraftBlock";
import { NothingBar } from "@/components/home/NothingBar";
import { ContactCta } from "@/components/home/ContactCta";
import { getStarredAlbums, getFavePhotos, localized } from "@/lib/pocketbase/queries";
import { fileUrl } from "@/lib/pocketbase/files";

// Revalida el contenido del CMS periódicamente (ISR) sin requerir rebuild.
export const revalidate = 300;

// Fallback local si el CMS no responde (build SSG, caída momentánea): el Home
// nunca queda vacío.
const STARRED_FALLBACK: StarredAlbumItem[] = [
  { title: "Start of the race", src: "/placeholders/cyclist-pack.jpg", alt: "", href: "/portfolio" },
  { title: "Middle race", src: "/placeholders/cyclist-bw-race.jpg", alt: "", href: "/portfolio" },
  { title: "The end", src: "/placeholders/cyclist-peloton.png", alt: "", href: "/portfolio" },
];

const FAVES_FALLBACK: FaveItem[] = [
  { src: "/placeholders/cyclist-portrait.jpg", alt: "" },
  { src: "/placeholders/cyclist-bw-race.jpg", alt: "" },
  { src: "/placeholders/cyclist-duo.jpg", alt: "" },
  { src: "/placeholders/cyclist-road.jpg", alt: "" },
  { src: "/placeholders/cyclist-pack.jpg", alt: "" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [starredAlbums, favePhotos] = await Promise.all([
    getStarredAlbums(),
    getFavePhotos(5),
  ]);

  const starred: StarredAlbumItem[] = starredAlbums.length
    ? starredAlbums.map((a) => ({
        title: localized(a, "title", locale),
        src: fileUrl({ collectionName: "albums", id: a.id }, a.cover, {
          thumb: "1200x0",
        }),
        alt: localized(a, "title", locale),
        href: `/portfolio/${a.slug}`,
      }))
    : STARRED_FALLBACK;

  const faves: FaveItem[] = favePhotos.length
    ? favePhotos.map((p) => ({
        src: fileUrl({ collectionName: "photos", id: p.id }, p.image, {
          thumb: "600x0",
        }),
        alt: localized(p, "alt", locale),
      }))
    : FAVES_FALLBACK;

  return (
    <main>
      <Hero />
      <BioBlock />
      <Marquee />
      <EditorialIntro />
      <StarredAlbums albums={starred} />
      <CraftBlock />
      <FavesGallery photos={faves} />
      <NothingBar />
      <ContactCta />
    </main>
  );
}
