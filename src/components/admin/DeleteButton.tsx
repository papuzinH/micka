"use client";

import { deleteRecord } from "@/lib/admin/actions";

export function DeleteButton({ slug, id }: { slug: string; id: string }) {
  return (
    <form
      action={deleteRecord}
      onSubmit={(e) => {
        if (!confirm("Delete this record? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="_collection" value={slug} />
      <input type="hidden" name="_id" value={id} />
      <button
        type="submit"
        className="font-body text-sm text-brand-white/50 transition-colors hover:text-brand-violet"
      >
        Delete
      </button>
    </form>
  );
}
