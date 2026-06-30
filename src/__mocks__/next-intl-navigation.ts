// Stub for next-intl/navigation used in the jsdom/Vitest environment.
// createNavigation requires the Next.js runtime (next/navigation) which is
// unavailable in jsdom. This stub provides a functional Link + navigation
// hooks so components that use localized navigation can be unit-tested.
import { createElement, type ReactNode } from "react";

type Href = string | { pathname: string };

function hrefToString(href: Href): string {
  return typeof href === "string" ? href : href?.pathname ?? "#";
}

export function createNavigation(_routing: unknown) {
  const Link = ({
    href,
    children,
    ...props
  }: { href: Href; children?: ReactNode } & Record<string, unknown>) =>
    createElement("a", { href: hrefToString(href), ...props }, children);

  return {
    Link,
    redirect: (_href: Href) => undefined,
    usePathname: () => "/",
    useRouter: () => ({
      push: () => {},
      replace: () => {},
      prefetch: () => {},
      back: () => {},
      forward: () => {},
      refresh: () => {},
    }),
    getPathname: ({ href }: { href: Href }) => hrefToString(href),
  };
}
