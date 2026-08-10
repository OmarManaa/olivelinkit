"use client";

import Link from "next/link";
import type { ReportingSeeds } from "./reporting-data";
import { money, reportDate, useReportingData } from "./reporting-data";

export function ReportsConsole(seeds: ReportingSeeds) {
  const data = useReportingData(seeds);
  const attentionJobs = [...data.dueToday, ...data.waitingParts, ...data.readyJobs]
    .filter((job, index, records) => records.findIndex((record) => record.reference === job.reference) === index)
    .slice(0, 5);

  return (
    <div className="reports-workspace">
      <section className="reports-summary-head">
        <div>
          <span>Live business report</span>
          <h2>Current business snapshot</h2>
          <p>Operational, sales, and stock figures from your current records.</p>
        </div>
        <div className="reports-as-of">
          <span>As of</span>
          <strong>{reportDate()}</strong>
          <small>Updates when records change</small>
        </div>
      </section>

      <section className="reports-kpi-grid" aria-label="Business report summary">
        <article data-tone="green"><span>Paid invoice total</span><strong>{money(data.paidTotal)}</strong><small>{data.paidInvoices.length} paid record{data.paidInvoices.length === 1 ? "" : "s"}</small><Link href="/admin/invoices">View invoices</Link></article>
        <article data-tone="amber"><span>Outstanding invoice work</span><strong>{money(data.openInvoiceTotal)}</strong><small>{data.openInvoices.length} draft or sent invoice{data.openInvoices.length === 1 ? "" : "s"}</small><Link href="/admin/invoices">Review billing</Link></article>
        <article data-tone="blue"><span>Quote pipeline</span><strong>{money(data.quotePipeline)}</strong><small>{data.pendingQuotes.length} draft or sent quote{data.pendingQuotes.length === 1 ? "" : "s"}</small><Link href="/admin/quotes">Review quotes</Link></article>
        <article data-tone="slate"><span>Active workload</span><strong>{data.activeJobs.length}</strong><small>{data.dueToday.length} due today, {data.highPriority.length} high priority</small><Link href="/admin/jobs">Open job queue</Link></article>
      </section>

      <section className="reports-detail-grid">
        <article className="reports-card">
          <header><div><span>Operations</span><h2>Work queue</h2></div><Link href="/admin/jobs">All jobs</Link></header>
          <dl className="reports-breakdown">
            <div><dt>Due today</dt><dd>{data.dueToday.length}</dd><small>{data.highPriority.filter((job) => job.dueAt === "Today").length} high priority</small></div>
            <div><dt>Waiting on parts</dt><dd>{data.waitingParts.length}</dd><small>Confirm stock and supplier ETA</small></div>
            <div><dt>Ready for handover</dt><dd>{data.readyJobs.length}</dd><small>Arrange pickup or close-out</small></div>
          </dl>
        </article>

        <article className="reports-card">
          <header><div><span>Customer care</span><h2>Next contact</h2></div><Link href="/admin/followups">Follow-ups</Link></header>
          <dl className="reports-breakdown">
            <div><dt>Follow-ups due</dt><dd>{data.dueFollowups.length}</dd><small>{data.dueFollowups[0]?.customer || "No customer waiting"}</small></div>
            <div><dt>Open jobs</dt><dd>{data.activeJobs.length}</dd><small>Keep owners and due dates current</small></div>
            <div><dt>Quote decisions</dt><dd>{data.pendingQuotes.filter((quote) => quote.status === "Sent").length}</dd><small>Sent quotes awaiting a response</small></div>
          </dl>
        </article>

        <article className="reports-card">
          <header><div><span>Inventory</span><h2>Stock watch</h2></div><Link href="/admin/inventory">Inventory</Link></header>
          <div className="reports-stock-list">
            {data.lowStock.slice(0, 4).map((item) => <div key={item.sku}><strong>{item.name}</strong><span>{item.quantity} available, reorder at {item.reorderLevel}</span></div>)}
            {data.lowStock.length === 0 && <p>All stock is above the reorder level.</p>}
          </div>
        </article>
      </section>

      <section className="reports-card reports-attention-card">
        <header><div><span>Action list</span><h2>Items needing attention</h2></div><Link href="/admin/reports/export">Export report</Link></header>
        <div className="reports-attention-list">
          {attentionJobs.map((job) => (
            <Link href={`/admin/jobs/${encodeURIComponent(job.reference)}/edit`} key={job.reference}>
              <span className={`pill ${job.tone}`}>{job.status}</span>
              <strong>{job.reference} - {job.customer}</strong>
              <small>{job.issue}</small>
            </Link>
          ))}
          {data.dueFollowups.slice(0, 2).map((followup) => (
            <Link href="/admin/followups" key={followup.id}>
              <span className={`pill ${followup.tone}`}>{followup.status}</span>
              <strong>{followup.id} - {followup.customer}</strong>
              <small>{followup.reason}</small>
            </Link>
          ))}
          {attentionJobs.length === 0 && data.dueFollowups.length === 0 && <p className="reports-clear-state">No urgent job or follow-up needs attention right now.</p>}
        </div>
      </section>
    </div>
  );
}
