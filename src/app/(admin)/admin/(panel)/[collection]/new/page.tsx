import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminPb } from "@/lib/pocketbase/admin";
import { getCollection } from "@/lib/admin/collections";
import { loadRelationOptions } from "@/lib/admin/load";
import { RecordForm } from "@/components/admin/RecordForm";

export default async function NewRecordPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: slug } = await params;
  const collection = getCollection(slug);
  if (!collection || collection.canCreate === false) notFound();

  const pb = await requireAdminPb();
  const relationOptions = await loadRelationOptions(pb, collection);

  return (
    <div className="p-8">
      <Link
        href={`/admin/${slug}`}
        className="font-body text-sm text-brand-white/50 transition-colors hover:text-brand-violet"
      >
        ← {collection.label}
      </Link>
      <h1 className="mt-4 font-display text-3xl uppercase text-brand-white">
        New {collection.labelSingular}
      </h1>
      <div className="mt-6">
        <RecordForm collection={collection} relationOptions={relationOptions} />
      </div>
    </div>
  );
}
