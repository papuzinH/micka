import { z } from "zod";
import type { CollectionConfig, FieldConfig } from "./collections";

/** Nombres reales de un campo (los localizados se expanden a `_en`/`_fr`). */
export function fieldKeys(field: FieldConfig): string[] {
  return field.localized ? [`${field.name}_en`, `${field.name}_fr`] : [field.name];
}

function scalarSchema(field: FieldConfig): z.ZodTypeAny {
  switch (field.type) {
    case "number":
      return z.preprocess(
        (v) => (v === "" || v == null ? undefined : v),
        z.coerce.number().int().optional(),
      );
    case "bool":
      return z.boolean();
    case "email":
      return field.required
        ? z.string().email()
        : z.union([z.string().email(), z.literal("")]).optional();
    case "url":
      return field.required
        ? z.string().url()
        : z.union([z.string().url(), z.literal("")]).optional();
    case "select":
      return field.required
        ? z.enum(field.options as [string, ...string[]])
        : z.enum(field.options as [string, ...string[]]).optional();
    case "relation":
      return field.required ? z.string().min(1) : z.string().optional();
    case "date":
      return z.string().optional();
    default:
      // text | textarea | editor
      return field.required
        ? z.string().min(1, "Required")
        : z.string().optional();
  }
}

/** ZodObject de los campos no-file de la colección. */
export function buildSchema(collection: CollectionConfig): z.ZodTypeAny {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of collection.fields) {
    if (field.type === "file") continue;
    for (const key of fieldKeys(field)) shape[key] = scalarSchema(field);
  }
  return z.object(shape);
}

export interface ValidatedForm {
  success: boolean;
  data?: Record<string, unknown>;
  files?: Record<string, File>;
  errors?: Record<string, string>;
}

/** Extrae y valida un FormData según la config de la colección. Separa los
 *  archivos (File con contenido) de los campos escalares validados con Zod. */
export function validateForm(
  collection: CollectionConfig,
  formData: FormData,
): ValidatedForm {
  const raw: Record<string, unknown> = {};
  const files: Record<string, File> = {};

  for (const field of collection.fields) {
    if (field.type === "file") {
      const value = formData.get(field.name);
      if (value instanceof File && value.size > 0) files[field.name] = value;
      continue;
    }
    if (field.type === "bool") {
      const v = formData.get(field.name);
      raw[field.name] = v === "on" || v === "true";
      continue;
    }
    for (const key of fieldKeys(field)) {
      raw[key] = formData.get(key) ?? "";
    }
  }

  const parsed = buildSchema(collection).safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { success: false, errors };
  }

  return { success: true, data: parsed.data as Record<string, unknown>, files };
}
