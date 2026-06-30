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

// Datos placeholder de la Fase 2a — en la Fase 2b vienen del CMS (PocketBase).
const STARRED: StarredAlbumItem[] = [
  { title: "Start of the race", src: "/placeholders/cyclist-pack.jpg", alt: "", href: "/portfolio" },
  { title: "Middle race", src: "/placeholders/cyclist-bw-race.jpg", alt: "", href: "/portfolio" },
  { title: "The end", src: "/placeholders/cyclist-peloton.png", alt: "", href: "/portfolio" },
];

const FAVES: FaveItem[] = [
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

  return (
    <main>
      <Hero />
      <BioBlock />
      <Marquee />
      <EditorialIntro />
      <StarredAlbums albums={STARRED} />
      <CraftBlock />
      <FavesGallery photos={FAVES} />
      <NothingBar />
      <ContactCta />
    </main>
  );
}
