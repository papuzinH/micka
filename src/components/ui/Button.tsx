import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/cn";

type ButtonSize = "lg" | "sm" | "xl";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-2 py-2 text-h4", //   28px · Syne Bold 14px
  lg: "h-10 px-2 py-2.5 text-h3", // 40px · Syne Bold 16px
  xl: "h-[58px] px-6 text-h3", //    58px · hero CTAs
};

const baseClasses = cn(
  "inline-flex items-center justify-center gap-2.5 font-display uppercase text-white",
  "bg-brand-violet hover:bg-brand-violet-dark shadow-button transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black",
  "disabled:opacity-50 disabled:pointer-events-none"
);

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      data-testid="button-arrow"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
    >
      <path
        d="M4 12h16m0 0-6-6m6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type CommonProps = {
  size?: ButtonSize;
  iconLeft?: ReactNode;
  /** `undefined` → flecha por defecto · `null` → sin ícono · ReactNode → ícono custom. */
  iconRight?: ReactNode | null;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "children"> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<ComponentProps<"a">, "children" | "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  size = "lg",
  iconLeft,
  iconRight,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(baseClasses, sizeClasses[size], className);
  const arrow =
    iconRight === undefined ? (
      <ArrowRight className={size === "lg" ? "size-6" : "size-5"} />
    ) : (
      iconRight
    );

  const content = (
    <>
      {iconLeft}
      <span>{children}</span>
      {arrow}
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...linkProps } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as Omit<ButtonAsButton, keyof CommonProps>)}>
      {content}
    </button>
  );
}
