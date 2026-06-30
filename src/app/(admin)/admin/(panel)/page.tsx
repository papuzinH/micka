import Link from "next/link";
import { requireAdminPb } from "@/lib/pocketbase/admin";
import { COLLECTIONS } from "@/lib/admin/collections";

export default async function AdminDashboard() {
  const pb = await requireAdminPb();
  const counts = await Promise.all(
    COLLECTIONS.map(async (c) => {
      try {
        const res = await pb.collection(c.name).getList(1, 1);
        return { slug: c.slug, label: c.label, total: res.totalItems };
      } catch {
        return { slug: c.slug, label: c.label, total: 0 };
      }
    }),
  );

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl uppercase text-brand-white">
        Dashboard
      </h1>
      <p className="mt-2 font-body text-brand-white/60">
        Manage your site content.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map((c) => (
          <Link
            key={c.slug}
            href={`/admin/${c.slug}`}
            className="flex flex-col gap-1 rounded border border-brand-light-gray bg-brand-gray-bg p-5 transition-colors hover:border-brand-violet"
          >
            <span className="font-display text-3xl text-brand-white">
              {c.total}
            </span>
            <span className="font-body text-sm text-brand-white/60">
              {c.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
