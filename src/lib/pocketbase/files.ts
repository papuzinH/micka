import { getPocketBaseUrl } from "./client";

/** Mínimo de un record de PocketBase necesario para resolver una URL de archivo. */
export interface FileRecordRef {
  id: string;
  collectionName?: string;
  collectionId?: string;
}

/**
 * Construye la URL pública de un archivo almacenado en PocketBase.
 * Formato canónico: `{baseUrl}/api/files/{collection}/{recordId}/{filename}`.
 *
 * Devuelve "" cuando el campo file está vacío (los `file` opcionales del
 * esquema —cover, avatar, logo— pueden no tener valor). Acepta un `thumb`
 * para servir miniaturas generadas por PocketBase (p. ej. "600x0").
 *
 * El valor de `thumb` debe existir en el whitelist `thumbs` del campo en
 * `pb_schema.json` — si no, PocketBase sirve el original silenciosamente.
 */
export function fileUrl(
  record: FileRecordRef,
  filename: string,
  opts?: { thumb?: string },
): string {
  if (!filename) return "";
  const collection = record.collectionName ?? record.collectionId;
  if (!collection) {
    throw new Error("fileUrl: el record no tiene colección resoluble");
  }
  const base = getPocketBaseUrl().replace(/\/$/, "");
  const url = `${base}/api/files/${collection}/${record.id}/${filename}`;
  return opts?.thumb ? `${url}?thumb=${encodeURIComponent(opts.thumb)}` : url;
}
