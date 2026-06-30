import Image from "next/image";
import { useTranslations } from "next-intl";

export type FaveItem = { src: string; alt: string };

/** "My faves of all time": tira de fotos. Recibe las fotos por props;
 *  en 2b se mapearán desde `Photo[]` del CMS. */
export function FavesGallery({ photos }: { photos: FaveItem[] }) {
  const t = useTranslations("home.faves");
  return (
    <section className="mx-auto max-w-360 px-5 py-16 md:px-10">
      <h2 className="mb-12 text-center font-display text-h2 text-brand-white">
        {t("title")}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {photos.map((p, i) => (
          <div key={i} className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(max-width: 768px) 50vw, 220px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
