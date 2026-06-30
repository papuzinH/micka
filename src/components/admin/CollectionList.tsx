import Link from "next/link";
import type { RecordModel } from "pocketbase";
import type { CollectionConfig } from "@/lib/admin/collections";
import { DeleteButton } from "./DeleteButton";

function recordTitle(collection: CollectionConfig, r: RecordModel): string {
  const key = collection.titleLocalized
    ? `${collection.titleField}_en`
    : collection.titleField;
  return String(r[key] ?? r.id);
}

export function CollectionList({
  collection,
  records,
}: {
  collection: CollectionConfig;
  records: RecordModel[];
}) {
  const hasPublished = collection.fields.some((f) => f.name === "published");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase text-brand-white">
          {collection.label}
        </h1>
        {collection.canCreate !== false && (
          <Link
            href={`/admin/${collection.slug}/new`}
            className="rounded bg-brand-violet px-4 py-2 font-display text-h4 uppercase text-white shadow-button transition-colors hover:bg-brand-violet-dark"
          >
            + New
          </Link>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded border border-brand-light-gray">
        {records.length === 0 ? (
          <p className="p-6 font-body text-brand-white/50">No records yet.</p>
        ) : (
          <table className="w-full text-left">
            <tbody>
              {records.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-brand-light-gray transition-colors last:border-0 hover:bg-brand-gray-bg"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/${collection.slug}/${r.id}`}
                      className="font-body text-brand-white transition-colors hover:text-brand-violet"
                    >
                      {recordTitle(collection, r)}
                    </Link>
                  </td>
                  {hasPublished && (
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          r.published
                            ? "rounded bg-brand-violet/20 px-2 py-0.5 font-body text-xs text-brand-violet"
                            : "rounded bg-brand-light-gray px-2 py-0.5 font-body text-xs text-brand-white/50"
                        }
                      >
                        {r.published ? "Published" : "Draft"}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/${collection.slug}/${r.id}`}
                        className="font-body text-sm text-brand-white/70 transition-colors hover:text-brand-violet"
                      >
                        Edit
                      </Link>
                      <DeleteButton slug={collection.slug} id={r.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
