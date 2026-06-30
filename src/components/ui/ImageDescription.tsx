import Image from "next/image";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/cn";

type ImageDescriptionProps = {
  src: string;
  alt: string;
  title: string;
  href?: string;
  /** `sizes` para next/image; ajustar según el contenedor del consumidor. */
  sizes?: string;
  className?: string;
};

/**
 * Card "Image + Description" del UI Kit: imagen de fondo con una caja blanca
 * translúcida que muestra el título en Syne Bold 20px (violeta oscuro).
 * El contenedor define el tamaño (default aspect 440/230); pasar `href` la
 * convierte en link a un álbum.
 */
export function ImageDescription({
  src,
  alt,
  title,
  href,
  sizes = "(max-width: 768px) 100vw, 440px",
  className,
}: ImageDescriptionProps) {
  const base = cn(
    "group relative block aspect-[440/230] w-full overflow-hidden",
    className
  );
  const content = (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-4 mx-auto w-[88%] max-w-[205px] bg-white/40 p-5 backdrop-blur-sm">
        <h3 className="font-display text-card text-brand-violet-dark">{title}</h3>
      </div>
    </>
  );

  return href ? (
    <Link href={href} className={base}>
      {content}
    </Link>
  ) : (
    <div className={base}>{content}</div>
  );
}
