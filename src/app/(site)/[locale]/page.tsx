import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { BioBlock } from "@/components/home/BioBlock";
import { Marquee } from "@/components/home/Marquee";

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
    </main>
  );
}
