"use client";

import { useEffect, useState } from "react";
import {
  House,
  Briefcase,
  User,
  MessageSquareQuote,
  Users,
  AtSign,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/lib/i18n/routing";
import { MenuItem } from "@/components/ui/MenuItem";
import { ToggleLanguage } from "@/components/ui/ToggleLanguage";
import { NAV_LINKS } from "./nav-links";

// Íconos temáticos del Figma (Material Symbols → equivalentes lucide).
const NAV_ICONS: Record<string, LucideIcon> = {
  home: House, // home
  portfolio: Briefcase, // business_center
  about: User, // person
  reviews: MessageSquareQuote, // reviews
  collabs: Users, // supervisor_account
  contact: AtSign, // alternate_email
};

export function Navbar() {
  const t = useTranslations("nav");
  const a11y = useTranslations("a11y");
  const locale = useLocale() as "en" | "fr";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Mientras el overlay mobile está abierto: bloquear scroll + cerrar con Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-15 border-b border-white/5 bg-brand-black/85 backdrop-blur">
        <nav className="mx-auto flex h-full max-w-360 items-center justify-between px-5 md:px-10">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="shrink-0 font-display text-sm font-extrabold uppercase leading-[1.1] text-brand-white [text-shadow:0_4px_4.5px_rgba(0,0,0,0.3)] md:text-[20px] md:leading-[20px]"
          >
            <span className="block text-brand-violet">Don Micka</span>
            <span className="block">de la Vega</span>
          </Link>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden items-center gap-3 md:flex md:gap-6">
              {NAV_LINKS.map((l) => {
                const Icon = NAV_ICONS[l.key];
                return (
                  <MenuItem
                    key={l.key}
                    href={l.href}
                    label={t(l.key)}
                    active={isActive(l.href)}
                    icon={<Icon className="size-5" aria-hidden="true" />}
                  />
                );
              })}
            </div>
            {/* En mobile, el toggle de la barra se oculta cuando el overlay abre. */}
            <span className={open ? "hidden md:block" : "block"}>
              <ToggleLanguage locale={locale} />
            </span>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? a11y("closeMenu") : a11y("openMenu")}
              className="inline-flex size-8 items-center justify-center text-brand-white md:hidden"
            >
              {open ? <CloseIcon /> : <BurgerIcon />}
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-15 z-40 bg-brand-black md:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="flex flex-col items-end gap-1 px-6 py-8">
            <div className="mb-3">
              <ToggleLanguage locale={locale} />
            </div>
            {NAV_LINKS.map((l) => {
              const Icon = NAV_ICONS[l.key];
              return (
                <MenuItem
                  key={l.key}
                  href={l.href}
                  label={t(l.key)}
                  active={isActive(l.href)}
                  variant="mobile"
                  icon={<Icon className="size-5" aria-hidden="true" />}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function BurgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-6">
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-6">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
