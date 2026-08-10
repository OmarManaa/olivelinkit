import { ADMIN_EMAIL, requireAdmin } from "./admin-auth";
import { AdminStateHydrator } from "./admin-state-hydrator";
import { Sidebar } from "./sidebar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({
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
