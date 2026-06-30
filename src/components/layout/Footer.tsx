import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { NAV_LINKS } from "./nav-links";

export function Footer() {
  const t = useTranslations("nav");
  const tf = useTranslations("footer");

  return (
    <footer className="border-t border-white/10 bg-brand-black px-5 py-12 md:px-10">
      <div className="mx-auto flex max-w-360 flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-card font-bold uppercase text-brand-white">
            Micka&apos;s Photos
          </p>
          <p className="mt-2 text-body text-brand-white/60">{tf("tagline")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className="text-body text-brand-white/80 transition-colors hover:text-brand-violet"
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
