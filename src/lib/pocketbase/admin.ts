import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RecordModel } from "pocketbase";
import { createPocketBase } from "./client";
import { parseAuthCookie, ADMIN_COOKIE } from "./auth";

/**
 * Devuelve un PocketBase autenticado como superuser a partir de la cookie de
 * sesión del admin (Stage 1). Redirige a `/admin/login` si no hay sesión
 * válida. Usar en Server Components y Server Actions del panel.
 */
export async function requireAdminPb() {
  const store = await cookies();
  const parsed = parseAuthCookie(store.get(ADMIN_COOKIE)?.value);
  if (!parsed) redirect("/admin/login");
  const pb = createPocketBase();
  pb.authStore.save(parsed.token, parsed.record as unknown as RecordModel);
  if (!pb.authStore.isValid) redirect("/admin/login");
  return pb;
}
