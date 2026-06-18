"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createPocketBase } from "@/lib/pocketbase/client";
import { ADMIN_COOKIE } from "@/lib/pocketbase/auth";

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
