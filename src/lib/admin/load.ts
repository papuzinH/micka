import type PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";
import { fileUrl } from "@/lib/pocketbase/files";
import type { CollectionConfig } from "./collections";
import type { Option } from "@/components/admin/FormField";

/** Carga las opciones (id → label) de cada campo `relation` de la colección. */
export async function loadRelationOptions(
  pb: PocketBase,
  collection: CollectionConfig,
): Promise<Record<string, Option[]>> {
  const result: Record<string, Option[]> = {};
  for (const field of collection.fields) {
    if (field.type !== "relation" || !field.relation) continue;
    try {
      const items = await pb
        .collection(field.relation.collection)
        .getFullList({ sort: "order" });
      result[field.name] = items.map((it) => ({
        value: it.id,
        label: String(it[field.relation!.labelField] ?? it.id),
      }));
    } catch {
      result[field.name] = [];
    }
  }
  return result;
}

/** URLs (thumb) de los archivos ya cargados, para preview en edición. */
export function loadFileUrls(
  collection: CollectionConfig,
  record: RecordModel,
): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const field of collection.fields) {
    if (field.type !== "file") continue;
    const filename = record[field.name];
    if (filename) {
      urls[field.name] = fileUrl(
        { collectionName: collection.name, id: record.id },
        String(filename),
        field.thumb ? { thumb: field.thumb } : undefined,
      );
    }
  }
  return urls;
}
