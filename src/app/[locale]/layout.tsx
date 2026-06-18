import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Syne, Inter } from "next/font/google";
import { routing } from "@/lib/i18n/routing";
import "../globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
      <body className="bg-brand-black text-brand-white font-body">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
