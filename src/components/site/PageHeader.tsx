/** Encabezado editorial reutilizable de las subpáginas: título H1 Syne con
 *  acento violeta y subtítulo opcional. Deriva del design system del Home. */
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mx-auto max-w-360 px-5 pt-12 pb-10 md:px-10 md:pt-20">
      <h1 className="font-display text-h1 uppercase leading-none text-brand-white">
        {title}
      </h1>
      <div className="mt-5 h-1 w-16 bg-brand-violet" />
      {subtitle && (
        <p className="mt-6 max-w-2xl font-body text-brand-white/70">{subtitle}</p>
      )}
    </header>
  );
}
