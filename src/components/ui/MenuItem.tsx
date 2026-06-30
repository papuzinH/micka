import type { ReactNode } from "react";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/cn";

type MenuItemProps = {
  href: string;
  label: string;
  active?: boolean;
  icon?: ReactNode;
  variant?: "desktop" | "mobile";
  className?: string;
};

/**
 * Link de navegación del UI Kit. Texto Inter 14px que pasa a violeta en
 * hover/active, con underline violeta. En desktop el underline aparece en
 * hover/active; en mobile (menú overlay) queda siempre visible.
 */
export function MenuItem({
  href,
  label,
  active = false,
  icon,
  variant = "desktop",
  className,
}: MenuItemProps) {
  const isMobile = variant === "mobile";
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative inline-flex items-center gap-[5px] px-[5px] py-2.5 font-body text-body whitespace-nowrap transition-colors",
        active ? "text-brand-violet" : "text-white hover:text-brand-violet",
        isMobile && "w-full justify-end",
        isMobile && active && "bg-brand-gray pl-[5px] pr-2.5",
        className
      )}
    >
      {!isMobile && icon}
      <span>{label}</span>
      {isMobile && icon}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute bottom-1 left-[5px] right-[5px] h-0.5 bg-brand-violet transition-opacity",
          active || isMobile
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        )}
      />
    </Link>
  );
}
