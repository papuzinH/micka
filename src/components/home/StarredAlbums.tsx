import { useTranslations } from "next-intl";
import { ImageDescription } from "@/components/ui/ImageDescription";
import { Button } from "@/components/ui/Button";
import { SplitReveal } from "@/lib/motion/SplitReveal";
import { StaggerGroup } from "@/lib/motion/StaggerGroup";
import { Parallax } from "@/lib/motion/Parallax";

export type StarredAlbumItem = {
  title: string;
  src: string;
  alt: string;
  href: string;
};

const OFFSETS = ["", "md:mt-10", "md:mt-20"];
// Profundidades de parallax por card — sutil, no compite con el fade/scale de entrada.
const DEPTHS = [0.03, 0.06, 0.09];

/** "Starred albums": 3 cards Image+Description escalonadas + CTA, sobre un
 *  fondo de líneas diagonales. Recibe los álbumes por props; en 2b se mapearán
 *  desde `Album[]` del CMS.
 *
 *  Nota de motion: cada card es un wrapper (target de `StaggerGroup`, entrada
 *  fade+y+scale) con un `Parallax` anidado adentro (scroll continuo en `y`)
 *  — dos elementos DOM distintos a propósito: si ambos animaran `y` sobre el
 *  mismo nodo, sus tweens de GSAP competirían (overwrite) y el resultado
 *  sería un jitter visible. */
export function StarredAlbums({ albums }: { albums: StarredAlbumItem[] }) {
  const t = useTranslations("home.starred");
  return (
    <section>
      <SplitReveal
        as="h2"
        type="lines"
        className="mx-auto max-w-360 px-5 pb-12 pt-16 text-center font-display text-h2 text-brand-white md:px-10"
      >
        {t("title")}
      </SplitReveal>
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0,transparent_9px,rgba(255,255,255,0.04)_9px,rgba(255,255,255,0.04)_10px)]"
        />
        <div className="relative mx-auto max-w-360 px-5 py-16 md:px-10">
          <StaggerGroup
            className="grid gap-6 md:grid-cols-3"
            from={{ opacity: 0, y: 30, scale: 0.95 }}
          >
            {albums.map((a, i) => (
              <div key={a.href + i} className={OFFSETS[i % OFFSETS.length]}>
                <Parallax speed={DEPTHS[i % DEPTHS.length]}>
                  <ImageDescription
                    src={a.src}
                    alt={a.alt}
                    title={a.title}
                    href={a.href}
                    sizes="(max-width: 768px) 100vw, 440px"
                  />
                </Parallax>
              </div>
            ))}
          </StaggerGroup>
          <div className="mt-12 flex justify-center">
            <Button href="/portfolio">{t("cta")}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
