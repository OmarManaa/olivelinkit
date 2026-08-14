import { ADMIN_EMAIL, requireAdmin } from "../admin-auth";
import { AdminStateHydrator } from "../admin-state-hydrator";
import { Sidebar } from "../sidebar";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <main className="admin-shell">
      <Sidebar adminEmail={ADMIN_EMAIL} />
      <div className="admin-main"><AdminStateHydrator />{children}</div>
    </main>
  );
}
