"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createPocketBase } from "@/lib/pocketbase/client";
import { ADMIN_COOKIE } from "@/lib/pocketbase/auth";
import { requireAdminPb } from "@/lib/pocketbase/admin";
import { validatePasswordChange } from "@/lib/admin/password";

export async function loginAdmin(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const pb = createPocketBase();
  try {
    await pb.collection("_superusers").authWithPassword(email, password);
  } catch {
    return { error: "Credenciales inválidas" };
  }
  const store = await cookies();
  store.set(
    ADMIN_COOKIE,
    JSON.stringify({ token: pb.authStore.token, record: pb.authStore.record }),
    { httpOnly: true, secure: true, sameSite: "strict", path: "/admin" },
  );
  redirect("/admin");
}

export async function logoutAdmin() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export interface ChangePasswordState {
  error?: string;
}

/** Cambia la contraseña del superuser logueado. PocketBase invalida los tokens
 *  al cambiar la clave, así que borramos la cookie y forzamos re-login. */
export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const oldPassword = String(formData.get("oldPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const validationError = validatePasswordChange({
    oldPassword,
    newPassword,
    confirmPassword,
  });
  if (validationError) return { error: validationError };

  const pb = await requireAdminPb();
  const id = pb.authStore.record?.id;
  if (!id) return { error: "Session expired. Please log in again." };

  try {
    await pb.collection("_superusers").update(id, {
      oldPassword,
      password: newPassword,
      passwordConfirm: newPassword,
    });
  } catch {
    return {
      error: "Could not update password. Check your current password and try again.",
    };
  }

  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
