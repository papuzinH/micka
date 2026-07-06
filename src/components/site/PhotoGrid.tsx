import Image from "next/image";
import { StaggerGroup } from "@/lib/motion/StaggerGroup";

export type PhotoGridItem = {
  src: string;
  alt: string;
  caption?: string;
};

/** Grid uniforme de fotos del detalle de álbum. Caption opcional como overlay
 *  al hover. Entrada liviana (fade+y en cascada); sin parallax/pin — set
 *  reutilizable de subpáginas, no el despliegue completo del Home. */
export function PhotoGrid({ photos }: { photos: PhotoGridItem[] }) {
  return (
    <StaggerGroup
      className="grid grid-cols-2 gap-3 md:grid-cols-3"
      from={{ opacity: 0, y: 20 }}
      stagger={0.06}
    >
      {photos.map((p, i) => (
        <figure
          key={i}
          className="group relative aspect-[3/4] overflow-hidden bg-brand-gray"
        >
          <Image
            src={p.src}
            alt={p.alt}
            fill
            loading={i < 6 ? undefined : "lazy"}
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {p.caption && (
            <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 font-body text-sm text-brand-white transition-transform duration-300 group-hover:translate-y-0">
              {p.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </StaggerGroup>
  );
}
