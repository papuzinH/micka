"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COLLECTIONS } from "@/lib/admin/collections";
import { logoutAdmin } from "@/app/(admin)/admin/actions";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const pathname = usePathname();
  const linkCls = (active: boolean) =>
    cn(
      "block rounded px-3 py-2 font-body text-sm transition-colors",
      active
        ? "bg-brand-violet text-white"
        : "text-brand-white/70 hover:bg-brand-gray hover:text-white",
    );

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-brand-light-gray bg-brand-gray-bg p-4">
      <Link
        href="/admin"
        className="mb-6 block font-display text-lg uppercase text-brand-white"
      >
        Panel Micka
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        <Link href="/admin" className={linkCls(pathname === "/admin")}>
          Dashboard
        </Link>
        <div className="my-2 h-px bg-brand-light-gray" />
        {COLLECTIONS.map((c) => (
          <Link
            key={c.slug}
            href={`/admin/${c.slug}`}
            className={linkCls(pathname.startsWith(`/admin/${c.slug}`))}
          >
            {c.label}
          </Link>
        ))}
      </nav>
      <form action={logoutAdmin} className="mt-4">
        <button
          type="submit"
          className="w-full rounded px-3 py-2 text-left font-body text-sm text-brand-white/60 transition-colors hover:bg-brand-gray hover:text-brand-violet"
        >
          Log out
        </button>
      </form>
    </aside>
  );
}
