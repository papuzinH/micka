import Image from "next/image";
import { Link } from "@/lib/i18n/routing";

export type AlbumCardData = {
  href: string;
  src: string;
  alt: string;
  title: string;
  meta?: string;
};

/** Card de álbum para la galería del Portfolio: cover con zoom al hover y
 *  título Syne debajo que vira a violeta. */
export function AlbumCard({ href, src, alt, title, meta }: AlbumCardData) {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-gray">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <h3 className="mt-3 font-display text-card uppercase text-brand-white transition-colors group-hover:text-brand-violet">
        {title}
      </h3>
      {meta && (
        <p className="mt-1 font-body text-sm text-brand-white/50">{meta}</p>
      )}
    </Link>
  );
}
