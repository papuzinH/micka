import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidAuth, ADMIN_COOKIE } from "@/lib/pocketbase/auth";
import { logoutAdmin } from "./actions";

export default async function AdminDashboard() {
  const store = await cookies();
  if (!isValidAuth(store.get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
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
