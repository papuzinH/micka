"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveRecord, type SaveState } from "@/lib/admin/actions";
import type { CollectionConfig } from "@/lib/admin/collections";
import { FormField, type Option } from "./FormField";

export function RecordForm({
  collection,
  recordId,
  values = {},
  relationOptions = {},
  fileUrls = {},
}: {
  collection: CollectionConfig;
  recordId?: string;
  values?: Record<string, unknown>;
  relationOptions?: Record<string, Option[]>;
  fileUrls?: Record<string, string>;
}) {
  const [state, action, pending] = useActionState(saveRecord, {
    success: false,
  } as SaveState);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <input type="hidden" name="_collection" value={collection.slug} />
      {recordId && <input type="hidden" name="_id" value={recordId} />}

      {errors._ && (
        <p
          role="alert"
          className="border-l-2 border-brand-violet bg-brand-gray-bg p-3 font-body text-sm text-brand-violet"
        >
          {errors._}
        </p>
      )}

      {collection.fields.map((field) => (
        <FormField
          key={field.name}
          field={field}
          values={values}
          errors={errors}
          options={relationOptions[field.name] ?? []}
          fileUrl={fileUrls[field.name]}
        />
      ))}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-brand-violet px-5 py-2.5 font-display text-h4 uppercase text-white shadow-button transition-colors hover:bg-brand-violet-dark disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <Link
          href={`/admin/${collection.slug}`}
          className="rounded border border-brand-light-gray px-5 py-2.5 font-body text-sm text-brand-white/70 transition-colors hover:text-white"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
