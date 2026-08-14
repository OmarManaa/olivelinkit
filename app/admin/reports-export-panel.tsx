"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultWebsiteContent, type WebsiteContent } from "../website-content-data";
import { readWebsiteContent } from "../website-content-store";
import type { ReportingData, ReportingSeeds } from "./reporting-data";
import { money, reportDate, useReportingData } from "./reporting-data";

type ReportType = "overview" | "financial" | "operations" | "stock";

const reportTitles: Record<ReportType, string> = {
  overview: "Business overview",
  financial: "Financial summary",
  operations: "Operations report",
  stock: "Stock watch report",
};

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvRows(type: ReportType, data: ReportingData) {
  if (type === "financial") {
    return [
      ["Invoice", "Customer", "Related job", "Status", "Total", "Due"],
      ...data.invoices.map((invoice) => [invoice.reference, invoice.customer, invoice.relatedJob, invoice.status, invoice.total, invoice.dueAt]),
    ];
  }
  if (type === "operations") {
    return [
      ["Job", "Customer", "Device", "Issue", "Status", "Priority", "Owner", "Due"],
      ...data.activeJobs.map((job) => [job.reference, job.customer, job.device, job.issue, job.status, job.priority, job.owner, job.dueAt]),
    ];
  }
  if (type === "stock") {
    return [
      ["SKU", "Item", "Category", "Available", "Reorder level", "Condition", "Sale price"],
      ...data.inventory.map((item) => [item.sku, item.name, item.category, item.quantity, item.reorderLevel, item.condition, item.salePrice]),
    ];
  }
  return [
    ["Metric", "Value", "Notes"],
    ["Paid invoice total", data.paidTotal, `${data.paidInvoices.length} paid records`],
    ["Outstanding invoice work", data.openInvoiceTotal, `${data.openInvoices.length} draft or sent invoices`],
    ["Quote pipeline", data.quotePipeline, `${data.pendingQuotes.length} draft or sent quotes`],
    ["Active workload", data.activeJobs.length, `${data.dueToday.length} due today`],
    ["Follow-ups due", data.dueFollowups.length, data.dueFollowups[0]?.customer || "None"],
    ["Low-stock items", data.lowStock.length, data.lowStock.map((item) => item.name).join("; ") || "None"],
  ];
}

function downloadCsv(type: ReportType, data: ReportingData) {
  const csv = csvRows(type, data).map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function ReportDocument({ brand, data, type }: { brand: WebsiteContent; data: ReportingData; type: ReportType }) {
  const title = reportTitles[type];

  return (
    <article className="report-export-document">
      <header className="report-export-header">
        <div>
          <span>Internal business report</span>
          <h1>{title}</h1>
          <p>{brand.businessLegalName || brand.brandTitle}</p>
          {brand.businessAbn && <small>ABN {brand.businessAbn}</small>}
        </div>
        <div>
          <span>Generated</span>
          <strong>{reportDate()}</strong>
          <small>Current saved records</small>
        </div>
      </header>

      {type === "overview" && (
        <>
          <section className="report-export-stat-grid">
            <div><span>Paid invoices</span><strong>{money(data.paidTotal)}</strong><small>{data.paidInvoices.length} paid records</small></div>
            <div><span>Outstanding invoices</span><strong>{money(data.openInvoiceTotal)}</strong><small>{data.openInvoices.length} draft or sent</small></div>
            <div><span>Quote pipeline</span><strong>{money(data.quotePipeline)}</strong><small>{data.pendingQuotes.length} draft or sent</small></div>
            <div><span>Active jobs</span><strong>{data.activeJobs.length}</strong><small>{data.dueToday.length} due today</small></div>
          </section>
          <section className="report-export-section">
            <h2>Operational priorities</h2>
            <table>
              <thead><tr><th>Area</th><th>Current position</th><th>Recommended next action</th></tr></thead>
              <tbody>
                <tr><td>High-priority work</td><td>{data.highPriority.length} active job{data.highPriority.length === 1 ? "" : "s"}</td><td>Confirm ownership and customer update timing.</td></tr>
                <tr><td>Waiting parts</td><td>{data.waitingParts.length} job{data.waitingParts.length === 1 ? "" : "s"}</td><td>Check stock, supplier ETA, and customer expectation.</td></tr>
                <tr><td>Customer follow-ups</td><td>{data.dueFollowups.length} due</td><td>Contact the next customer and record the outcome.</td></tr>
                <tr><td>Stock alerts</td><td>{data.lowStock.length} item{data.lowStock.length === 1 ? "" : "s"}</td><td>Review reorder quantities before the next job needs them.</td></tr>
              </tbody>
            </table>
          </section>
        </>
      )}

      {type === "financial" && (
        <>
          <section className="report-export-stat-grid three-up">
            <div><span>Paid invoice total</span><strong>{money(data.paidTotal)}</strong><small>{data.paidInvoices.length} paid records</small></div>
            <div><span>Outstanding invoices</span><strong>{money(data.openInvoiceTotal)}</strong><small>{data.openInvoices.length} draft or sent</small></div>
            <div><span>Quote pipeline</span><strong>{money(data.quotePipeline)}</strong><small>{data.pendingQuotes.length} draft or sent</small></div>
          </section>
          <section className="report-export-section">
            <h2>Invoice register</h2>
            <table>
              <thead><tr><th>Invoice</th><th>Customer</th><th>Related job</th><th>Status</th><th>Total</th><th>Due</th></tr></thead>
              <tbody>{data.invoices.map((invoice) => <tr key={invoice.reference}><td>{invoice.reference}</td><td>{invoice.customer}</td><td>{invoice.relatedJob}</td><td>{invoice.status}</td><td>{money(invoice.total)}</td><td>{invoice.dueAt}</td></tr>)}</tbody>
            </table>
            {data.invoices.length === 0 && <p className="report-export-empty">No invoice records are available.</p>}
          </section>
        </>
      )}

      {type === "operations" && (
        <>
          <section className="report-export-stat-grid three-up">
            <div><span>Active jobs</span><strong>{data.activeJobs.length}</strong><small>{data.dueToday.length} due today</small></div>
            <div><span>High priority</span><strong>{data.highPriority.length}</strong><small>Open jobs requiring focus</small></div>
            <div><span>Ready for handover</span><strong>{data.readyJobs.length}</strong><small>Customer close-out required</small></div>
          </section>
          <section className="report-export-section">
            <h2>Active job register</h2>
            <table>
              <thead><tr><th>Job</th><th>Customer</th><th>Issue</th><th>Status</th><th>Priority</th><th>Owner</th><th>Due</th></tr></thead>
              <tbody>{data.activeJobs.map((job) => <tr key={job.reference}><td>{job.reference}</td><td>{job.customer}</td><td>{job.issue}</td><td>{job.status}</td><td>{job.priority}</td><td>{job.owner}</td><td>{job.dueAt}</td></tr>)}</tbody>
            </table>
            {data.activeJobs.length === 0 && <p className="report-export-empty">No active jobs are available.</p>}
          </section>
        </>
      )}

      {type === "stock" && (
        <>
          <section className="report-export-stat-grid three-up">
            <div><span>Inventory records</span><strong>{data.inventory.length}</strong><small>Parts and sale equipment</small></div>
            <div><span>Low-stock alerts</span><strong>{data.lowStock.length}</strong><small>At or below reorder level</small></div>
            <div><span>Public equipment</span><strong>{data.inventory.filter((item) => item.type === "Equipment" && item.publicVisible).length}</strong><small>Visible on the website</small></div>
          </section>
          <section className="report-export-section">
            <h2>Stock register</h2>
            <table>
              <thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>Available</th><th>Reorder</th><th>Condition</th><th>Price</th></tr></thead>
              <tbody>{data.inventory.map((item) => <tr key={item.sku}><td>{item.sku}</td><td>{item.name}</td><td>{item.category}</td><td>{item.quantity}</td><td>{item.reorderLevel}</td><td>{item.condition}</td><td>{money(item.salePrice)}</td></tr>)}</tbody>
            </table>
          </section>
        </>
      )}

      <footer className="report-export-footer">Prepared from the current records in OliveLink IT Solutions Business Console.</footer>
    </article>
  );
}

export function ReportsExportPanel(seeds: ReportingSeeds) {
  const data = useReportingData(seeds);
  const [type, setType] = useState<ReportType>("overview");
  const [brand, setBrand] = useState<WebsiteContent>(defaultWebsiteContent);

  useEffect(() => {
    const refresh = () => setBrand(readWebsiteContent());
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("website-content-updated", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("website-content-updated", refresh);
    };
  }, []);

  return (
    <div className="reports-export-workspace">
      <section className="reports-export-toolbar no-print">
        <div>
          <span>Export setup</span>
          <h2>Choose the report you need</h2>
          <p>The PDF is created through your browser&apos;s Print dialog, where you can choose Save as PDF.</p>
        </div>
        <label>
          <span>Report contents</span>
          <select onChange={(event) => setType(event.target.value as ReportType)} value={type}>
            <option value="overview">Business overview</option>
            <option value="financial">Financial summary</option>
            <option value="operations">Operations report</option>
            <option value="stock">Stock watch report</option>
          </select>
        </label>
        <div className="reports-export-actions">
          <Link className="button button-ghost" href="/admin/reports">Back to reports</Link>
          <button className="button button-ghost" onClick={() => downloadCsv(type, data)} type="button">Download CSV</button>
          <button className="button" onClick={() => window.print()} type="button">Print / save as PDF</button>
        </div>
      </section>
      <ReportDocument brand={brand} data={data} type={type} />
    </div>
  );
}
