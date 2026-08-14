import Link from "next/link";
import { followups, inventory, invoices, jobs, quotes } from "../admin-data";
import { DashboardConsole } from "../dashboard-console";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const todayLabel = new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(new Date());

  return (
    <>
      <header className="admin-topbar dashboard-topbar">
        <div>
          <h1>Dashboard</h1>
          <small>{todayLabel} - Business overview</small>
        </div>
        <div className="dashboard-topbar-actions">
          <Link className="admin-action secondary" href="/">Public site</Link>
          <span className="admin-badge">Online</span>
        </div>
      </header>
      <div className="admin-content">
        <DashboardConsole followups={followups} inventory={inventory} invoices={invoices} jobs={jobs} quotes={quotes} />
      </div>
    </>
  );
}
