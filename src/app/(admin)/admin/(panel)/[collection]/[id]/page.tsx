import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminPb } from "@/lib/pocketbase/admin";
import { getCollection } from "@/lib/admin/collections";
import { loadRelationOptions, loadFileUrls } from "@/lib/admin/load";
import { RecordForm } from "@/components/admin/RecordForm";
import { MessageView } from "@/components/admin/MessageView";

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection: slug, id } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const pb = await requireAdminPb();
  const record = await pb
    .collection(collection.name)
    .getOne(id)
    .catch(() => null);
  if (!record) notFound();

  if (collection.canEdit === false) {
    return <MessageView collection={collection} record={record} />;
  }

  const relationOptions = await loadRelationOptions(pb, collection);
  const fileUrls = loadFileUrls(collection, record);

  return (
    <div className="p-8">
      <Link
        href={`/admin/${slug}`}
        className="font-body text-sm text-brand-white/50 transition-colors hover:text-brand-violet"
      >
        ← {collection.label}
      </Link>
      <h1 className="mt-4 font-display text-3xl uppercase text-brand-white">
        Edit {collection.labelSingular}
      </h1>
      <div className="mt-6">
        <RecordForm
          collection={collection}
          recordId={id}
          values={record}
          relationOptions={relationOptions}
          fileUrls={fileUrls}
        />
      </div>
    </div>
  );
}
