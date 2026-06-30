"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminPb } from "@/lib/pocketbase/admin";
import { getCollection } from "./collections";
import { validateForm } from "./form";

export interface SaveState {
  success: boolean;
  errors?: Record<string, string>;
}

function errorMessage(e: unknown): string {
  if (e && typeof e === "object") {
    const resp = (e as { response?: { data?: Record<string, { message?: string }> } })
      .response;
    if (resp?.data) {
      const first = Object.values(resp.data)[0];
      if (first?.message) return first.message;
    }
    if ("message" in e && typeof (e as { message: unknown }).message === "string") {
      return (e as { message: string }).message;
    }
  }
  return "Something went wrong. Please try again.";
}

/** Crea (sin `_id`) o actualiza (con `_id`) un record de la colección indicada
 *  por el hidden `_collection`. Pensada para `useActionState`. */
export async function saveRecord(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const slug = String(formData.get("_collection") ?? "");
  const id = formData.get("_id") ? String(formData.get("_id")) : null;
  const collection = getCollection(slug);
  if (!collection) return { success: false, errors: { _: "Unknown collection" } };

  const result = validateForm(collection, formData);
  if (!result.success) return { success: false, errors: result.errors };

  const pb = await requireAdminPb();
  const payload = { ...result.data, ...result.files };
  try {
    if (id) await pb.collection(collection.name).update(id, payload);
    else await pb.collection(collection.name).create(payload);
  } catch (e) {
    return { success: false, errors: { _: errorMessage(e) } };
  }

  revalidatePath("/", "layout");
  redirect(`/admin/${slug}`);
}

/** Borra un record (hidden `_collection` + `_id`). Form action simple. */
export async function deleteRecord(formData: FormData): Promise<void> {
  const slug = String(formData.get("_collection") ?? "");
  const id = String(formData.get("_id") ?? "");
  const collection = getCollection(slug);
  if (!collection || !id) return;

  const pb = await requireAdminPb();
  try {
    await pb.collection(collection.name).delete(id);
  } catch {
    // si ya no existe, seguimos al listado igual
  }

  revalidatePath("/", "layout");
  redirect(`/admin/${slug}`);
}
