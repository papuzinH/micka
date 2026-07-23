import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Syne, Inter } from "next/font/google";
import { routing } from "@/lib/i18n/routing";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/lib/motion/MotionProvider";
import { TransitionProvider } from "@/lib/motion/TransitionProvider";
import { getSiteUrl } from "@/lib/seo/site";
import "../../globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["700", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "600"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: t("title"), template: "%s — Don Micka de la Vega" },
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: "Don Micka de la Vega",
      locale: locale === "fr" ? "fr_FR" : "en_US",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale} className={`${syne.variable} ${inter.variable}`}>
      <body className="bg-brand-gray-bg text-brand-white font-body">
        <NextIntlClientProvider>
          <MotionProvider>
            <TransitionProvider>
              <Navbar />
              <div className="pt-15">{children}</div>
              <Footer />
            </TransitionProvider>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
