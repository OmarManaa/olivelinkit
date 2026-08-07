import Link from "next/link";
import { activities, jobs, metrics } from "./admin-data";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Dashboard</h1>
          <small>Thursday, 6 August 2026 - Business overview</small>
        </div>
        <span className="admin-badge">Online</span>
      </header>
      <div className="admin-content">
        <section className="metric-grid">
          {metrics.map(([label, value, hint]) => (
            <article className="metric" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              {hint && <em>{hint}</em>}
            </article>
          ))}
        </section>
        <section className="dashboard-grid">
          <article className="admin-card" id="jobs">
            <div className="card-head">
              <h2>Active jobs</h2>
              <Link href="/admin/jobs">View all jobs -&gt;</Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="jobs-table">
                <thead><tr><th>Job</th><th>Customer</th><th>Device</th><th>Issue</th><th>Status</th></tr></thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.reference}>
                      <td className="job-title">{j.reference}</td><td>{j.customer}</td><td>{j.device}</td><td>{j.issue}</td><td><span className={`pill ${j.tone}`}>{j.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <article className="admin-card">
            <div className="card-head">
              <h2>Recent activity</h2>
              <Link href="/admin/reports">All activity</Link>
            </div>
            <ul className="activity">
              {activities.map(([title, time]) => <li key={title}><b>{title}</b><small>{time}</small></li>)}
            </ul>
          </article>
        </section>
        <section className="quick-actions">
          <Link className="quick" href="/admin/jobs/new">+ New job<small>Create repair or support job</small></Link>
          <Link className="quick" href="/admin/customers/new">+ Customer<small>Add home or business client</small></Link>
          <Link className="quick" href="/admin/quotes/new">+ Quote<small>Prepare a customer quote</small></Link>
          <Link className="quick" href="/admin/inventory/new">+ Inventory<small>Add parts or equipment</small></Link>
        </section>
        <section className="section-page" id="customers">
          <h2>Customer & device records</h2>
          <p>Each customer can own multiple devices, jobs, quotes, files and follow-ups. Names are never used as the only record identifier.</p>
          <div className="empty-note">This V1 dashboard demonstrates the CRM structure. Persistent records are backed by the included database schema.</div>
        </section>
        <section className="section-page" id="quotes">
          <h2>Quotes & approvals</h2>
          <p>Structured quote headers and line items support labour, parts, GST, status and expiry dates.</p>
          <div className="empty-note">PDF output and customer accept/reject links are planned for the next workflow milestone.</div>
        </section>
        <section className="section-page" id="inventory">
          <h2>Inventory & refurbished equipment</h2>
          <p>Track SKU, quantity, cost, sale price, warranty, condition and whether a tested item appears publicly.</p>
          <div className="empty-note">Product photos are designed to use private object storage with only approved public images exposed to the website.</div>
        </section>
      </div>
    </>
  );
}
