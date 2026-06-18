import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseAuthCookie, ADMIN_COOKIE } from "@/lib/pocketbase/auth";
import { createPocketBase } from "@/lib/pocketbase/client";
import { logoutAdmin } from "./actions";
import type { RecordModel } from "pocketbase";

export default async function AdminDashboard() {
  const store = await cookies();
  const parsed = parseAuthCookie(store.get(ADMIN_COOKIE)?.value);
  if (!parsed) redirect("/admin/login");
  const pb = createPocketBase();
  pb.authStore.save(parsed.token, parsed.record as unknown as RecordModel);
  if (!pb.authStore.isValid) redirect("/admin/login");
  return (
    <main className="min-h-screen bg-brand-black text-brand-white p-8">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-3xl">Panel Micka</h1>
        <form action={logoutAdmin}><button className="text-brand-violet">Salir</button></form>
      </div>
      <p className="mt-4 text-brand-gray-light">CRUD de contenido — Stage 2.</p>
    </main>
  );
}
