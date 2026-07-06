import Image from "next/image";
import { useTranslations } from "next-intl";
import { SplitReveal } from "@/lib/motion/SplitReveal";
import { StaggerGroup } from "@/lib/motion/StaggerGroup";
import { Parallax } from "@/lib/motion/Parallax";

export type FaveItem = { src: string; alt: string };

// Profundidades de parallax alternadas por foto — la tira gana relieve sin marear.
const DEPTHS = [0.03, 0.06, 0.04, 0.07, 0.05];

/** "My faves of all time": tira de fotos. Recibe las fotos por props;
 *  en 2b se mapearán desde `Photo[]` del CMS.
 *
 *  Nota de motion: `StaggerGroup` anima la entrada (fade+y) de cada wrapper;
 *  `Parallax` va anidado adentro sobre un elemento propio (scroll continuo
 *  en `y`) para no competir por la misma propiedad del mismo nodo — mismo
 *  criterio que `StarredAlbums`. */
export function FavesGallery({ photos }: { photos: FaveItem[] }) {
  const t = useTranslations("home.faves");
  return (
    <section className="mx-auto max-w-360 px-5 py-16 md:px-10">
      <SplitReveal
        as="h2"
        type="lines"
        className="mb-12 text-center font-display text-h2 text-brand-white"
      >
        {t("title")}
      </SplitReveal>
      <StaggerGroup
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
        from={{ opacity: 0, y: 24 }}
      >
        {photos.map((p, i) => (
          <div key={i} className="relative aspect-[3/4] overflow-hidden">
            <Parallax speed={DEPTHS[i % DEPTHS.length]} className="absolute inset-0 scale-110">
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(max-width: 768px) 50vw, 220px"
                className="object-cover"
              />
            </Parallax>
          </div>
        ))}
      </StaggerGroup>
    </section>
  );
}
