import { notFound, redirect } from "next/navigation";
import { requireAdminPb } from "@/lib/pocketbase/admin";
import { getCollection } from "@/lib/admin/collections";
import { singletonTarget } from "@/lib/admin/singleton";
import { CollectionList } from "@/components/admin/CollectionList";

export default async function CollectionListPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const pb = await requireAdminPb();
  const records = await pb
    .collection(collection.name)
    .getFullList({ sort: collection.defaultSort });

  const target = singletonTarget(collection, records);
  if (target) redirect(target);

  return <CollectionList collection={collection} records={records} />;
}
