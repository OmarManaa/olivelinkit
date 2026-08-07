import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ExportReportsPage() {
  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Export Reports</h1>
          <small>Prepare operational reports for download</small>
        </div>
        <Link className="admin-action secondary" href="/admin/reports">Back to reports</Link>
      </header>
      <div className="admin-content">
        <section className="admin-form">
          <label>
            <span>Report type</span>
            <select defaultValue="monthly">
              <option value="monthly">Monthly revenue</option>
              <option value="jobs">Jobs completed</option>
              <option value="inventory">Inventory valuation</option>
            </select>
          </label>
          <label>
            <span>Format</span>
            <select defaultValue="csv">
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </label>
          <div className="form-actions">
            <Link className="button button-ghost" href="/admin/reports">Cancel</Link>
            <Link className="button" href="/admin/reports">Generate export</Link>
          </div>
        </section>
      </div>
    </>
  );
}
