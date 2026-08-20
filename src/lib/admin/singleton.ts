import type { CollectionConfig } from "./collections";

/**
 * Ruta del formulario del único registro de una colección `singleton`, para
 * saltearle a quien edita un listado de una sola fila. Devuelve `null` cuando
 * la colección es normal o cuando el registro todavía no existe (falta correr
 * el seed): en ese caso el listado se muestra como siempre.
 */
export function singletonTarget(
  collection: CollectionConfig,
  records: { id: string }[],
): string | null {
  if (!collection.singleton) return null;
  const only = records[0];
  return only ? `/admin/${collection.slug}/${only.id}` : null;
}
