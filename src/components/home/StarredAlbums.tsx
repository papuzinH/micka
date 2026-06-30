import { useTranslations } from "next-intl";
import { ImageDescription } from "@/components/ui/ImageDescription";
import { Button } from "@/components/ui/Button";

export type StarredAlbumItem = {
  title: string;
  src: string;
  alt: string;
  href: string;
};

/** "Starred albums": 3 cards Image+Description escalonadas + CTA, sobre un
 *  fondo de líneas diagonales. Recibe los álbumes por props; en 2b se mapearán
 *  desde `Album[]` del CMS. */
export function StarredAlbums({ albums }: { albums: StarredAlbumItem[] }) {
  const t = useTranslations("home.starred");
  const offset = ["", "md:mt-10", "md:mt-20"];
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0,transparent_9px,rgba(255,255,255,0.04)_9px,rgba(255,255,255,0.04)_10px)]"
      />
      <div className="relative mx-auto max-w-360 px-5 py-16 md:px-10">
        <h2 className="mb-12 text-center font-display text-h2 text-brand-white">
          {t("title")}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {albums.map((a, i) => (
            <ImageDescription
              key={a.href + i}
              src={a.src}
              alt={a.alt}
              title={a.title}
              href={a.href}
              sizes="(max-width: 768px) 100vw, 440px"
              className={offset[i % offset.length]}
            />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Button href="/portfolio">{t("cta")}</Button>
        </div>
      </div>
    </section>
  );
}
