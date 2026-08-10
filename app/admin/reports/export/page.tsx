import Link from "next/link";
import { followups, inventory, invoices, jobs, quotes } from "../../admin-data";
import { ReportsExportPanel } from "../../reports-export-panel";

export const dynamic = "force-dynamic";

export default function ExportReportsPage() {
  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Export Reports</h1>
          <small>Preview the report, then print/save it as PDF or download its data as CSV</small>
        </div>
        <Link className="admin-action secondary" href="/admin/reports">Back to reports</Link>
      </header>
      <div className="admin-content"><ReportsExportPanel followups={followups} inventory={inventory} invoices={invoices} jobs={jobs} quotes={quotes} /></div>
    </>
  );
}
