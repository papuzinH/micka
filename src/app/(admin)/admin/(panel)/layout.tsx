import { requireAdminPb } from "@/lib/pocketbase/admin";
import { Sidebar } from "@/components/admin/Sidebar";

/** Layout de las rutas autenticadas del panel: guard centralizado + shell con
 *  sidebar. El login queda fuera de este grupo, sin sidebar. */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPb(); // redirige a /admin/login si no hay sesión válida
  return (
    <div className="flex min-h-screen bg-brand-black">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
