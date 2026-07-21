import { SplitReveal } from "@/lib/motion/SplitReveal";
import { GrowLine } from "@/lib/motion/GrowLine";
import { Reveal } from "@/lib/motion/Reveal";

/** Encabezado editorial reutilizable de las subpáginas: título H1 Syne con
 *  acento violeta y subtítulo opcional. Deriva del design system del Home.
 *  Entrance liviano y consistente (no el despliegue completo del Home). */
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mx-auto max-w-360 px-5 pt-12 pb-10 md:px-10 md:pt-20">
      <SplitReveal
        as="h1"
        type="lines"
        className="font-display text-4xl font-extrabold uppercase leading-[1.3] text-brand-white md:text-[45px]"
      >
        {title}
      </SplitReveal>
      <GrowLine
        axis="x"
        delay={0.2}
        className="mt-5 h-1 w-16 origin-left bg-brand-violet"
      />
      {subtitle && (
        <Reveal
          as="p"
          delay={0.25}
          className="mt-6 max-w-2xl font-body text-brand-white/70"
        >
          {subtitle}
        </Reveal>
      )}
    </header>
  );
}
