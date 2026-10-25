import AdminApp, { Login } from "@/components/admin/AdminApp";
import { isAdmin } from "@/lib/auth";
import { getConfig } from "@/lib/store";
import { isFirebaseEnabled } from "@/lib/firebase/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Control Room", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) return <Login />;
  let cfg;
  try { cfg = await getConfig(true); } catch {
    return (
      <div className="adm grid min-h-screen place-items-center bg-[#0a0b10] p-6 text-center text-zinc-100">
        <div>
          <h1 className="mb-2 font-serif text-2xl">Can’t reach the database</h1>
          <p className="text-sm text-zinc-400">The saved site settings could not be loaded, so the editor is disabled to avoid overwriting them. Check your Firebase / DATABASE_URL settings and refresh.</p>
        </div>
      </div>
    );
  }
  return <AdminApp initial={cfg} firebase={isFirebaseEnabled()} />;
}
