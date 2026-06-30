import Link from "next/link";
import type { RecordModel } from "pocketbase";
import type { CollectionConfig } from "@/lib/admin/collections";
import { DeleteButton } from "./DeleteButton";

/** Vista de solo lectura de un mensaje de contacto (la colección no se edita). */
export function MessageView({
  collection,
  record,
}: {
  collection: CollectionConfig;
  record: RecordModel;
}) {
  return (
    <div className="max-w-2xl p-8">
      <Link
        href={`/admin/${collection.slug}`}
        className="font-body text-sm text-brand-white/50 transition-colors hover:text-brand-violet"
      >
        ← {collection.label}
      </Link>
      <h1 className="mt-4 font-display text-3xl uppercase text-brand-white">
        {String(record.name)}
      </h1>

      <dl className="mt-6 space-y-2 font-body text-sm">
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-brand-white/40">Email</dt>
          <dd>
            <a
              href={`mailto:${record.email}`}
              className="text-brand-violet hover:underline"
            >
              {String(record.email)}
            </a>
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-brand-white/40">Locale</dt>
          <dd className="text-brand-white/80">{String(record.locale || "—")}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-24 shrink-0 text-brand-white/40">Received</dt>
          <dd className="text-brand-white/80">
            {new Date(String(record.created)).toLocaleString()}
          </dd>
        </div>
      </dl>

      <div className="mt-6 whitespace-pre-wrap rounded border border-brand-light-gray bg-brand-gray-bg p-4 font-body text-brand-white/90">
        {String(record.message)}
      </div>

      <div className="mt-8">
        <DeleteButton slug={collection.slug} id={record.id} />
      </div>
    </div>
  );
}
