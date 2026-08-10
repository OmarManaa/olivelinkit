"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readInventoryItems } from "../inventory-store";
import { readSupportRequests, type SupportRequest } from "../support-requests-store";
import type { Followup, InventoryItem, Invoice, Job, Quote } from "./admin-data";
import { readFollowups } from "./followups-store";
import { readInvoices } from "./invoices-store";
import { readJobs } from "./jobs-store";
import { readQuoteDrafts } from "./quotes-store";

type DashboardConsoleProps = {
  jobs: Job[];
  quotes: Quote[];
  invoices: Invoice[];
  followups: Followup[];
  inventory: InventoryItem[];
};

type WorkFilter = "all" | "today" | "high" | "waiting" | "progress" | "ready" | "new";

function mergeByReference<T extends { reference: string }>(baseRecords: T[], savedRecords: T[]) {
  const byReference = new Map<string, T>();
  for (const record of [...baseRecords, ...savedRecords]) byReference.set(record.reference, record);
  return Array.from(byReference.values());
}

function money(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function isActiveJob(job: Job) {
  return job.status !== "Completed" && !job.archivedAt;
}

function isDueToday(job: Job) {
  return job.dueAt === "Today";
}

function matchesFilter(job: Job, filter: WorkFilter) {
  if (filter === "all") return true;
  if (filter === "today") return isDueToday(job);
  if (filter === "high") return job.priority === "High";
  if (filter === "waiting") return job.status === "Waiting parts";
  if (filter === "progress") return job.status === "In progress";
  if (filter === "ready") return job.status === "Ready";
  return job.status === "New" || job.owner === "Unassigned";
}

function priorityScore(job: Job) {
  const statusScore: Record<string, number> = {
    New: 90,
    "Waiting parts": 86,
    "In progress": 74,
    Ready: 68,
    "Quote sent": 52,
  };
  return (statusScore[job.status] || 40) + (job.priority === "High" ? 30 : 0) + (isDueToday(job) ? 20 : 0);
}

function jobRecordHref(job: Job) {
  return `/admin/jobs/${encodeURIComponent(job.reference)}/edit`;
}

function jobAction(job: Job) {
  const jobHref = jobRecordHref(job);
  if (job.status === "Waiting parts") {
    return { label: "Check stock", href: "/admin/inventory", detail: "Confirm part ETA before promising a time." };
  }
  if (job.status === "In progress") {
    return { label: "Update job", href: jobHref, detail: "Record progress or next customer update." };
  }
  if (job.status === "Ready") {
    return { label: "Arrange pickup", href: "/admin/followups", detail: "Contact the customer and close the loop." };
  }
  if (job.status === "Quote sent") {
    return { label: "Follow quote", href: "/admin/quotes", detail: "Check approval and schedule work." };
  }
  if (job.status === "New" || job.owner === "Unassigned") {
    return { label: "Assign job", href: jobHref, detail: "Add owner, due time, and first action." };
  }
  return { label: "Open job", href: jobHref, detail: "Review the current service notes." };
}

function followupNeedsAction(followup: Followup) {
  return followup.status === "Due" || followup.status === "Overdue" || followup.dueAt === "Today";
}

function statusLabel(filter: WorkFilter) {
  if (filter === "all") return "All active work";
  if (filter === "today") return "Due today";
  if (filter === "high") return "High priority";
  if (filter === "waiting") return "Waiting parts";
  if (filter === "progress") return "In progress";
  if (filter === "ready") return "Ready";
  return "New / unassigned";
}

export function DashboardConsole({ jobs, quotes, invoices, followups, inventory }: DashboardConsoleProps) {
  const [jobRecords, setJobRecords] = useState<Job[]>(jobs);
  const [quoteRecords, setQuoteRecords] = useState<Quote[]>(quotes);
  const [invoiceRecords, setInvoiceRecords] = useState<Invoice[]>(invoices);
  const [followupRecords, setFollowupRecords] = useState<Followup[]>(followups);
  const [inventoryRecords, setInventoryRecords] = useState<InventoryItem[]>(inventory);
  const [requestRecords, setRequestRecords] = useState<SupportRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState<WorkFilter>("all");

  useEffect(() => {
    const refresh = () => {
      setJobRecords(readJobs(jobs));
      setQuoteRecords(mergeByReference(quotes, readQuoteDrafts()));
      setInvoiceRecords(mergeByReference(invoices, readInvoices()));
      setFollowupRecords(readFollowups(followups));
      setInventoryRecords(readInventoryItems());
      setRequestRecords(readSupportRequests());
    };

    refresh();
    window.addEventListener("jobs-updated", refresh);
    window.addEventListener("quote-drafts-updated", refresh);
    window.addEventListener("invoices-updated", refresh);
    window.addEventListener("followups-updated", refresh);
    window.addEventListener("inventory-items-updated", refresh);
    window.addEventListener("support-requests-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("jobs-updated", refresh);
      window.removeEventListener("quote-drafts-updated", refresh);
      window.removeEventListener("invoices-updated", refresh);
      window.removeEventListener("followups-updated", refresh);
      window.removeEventListener("inventory-items-updated", refresh);
      window.removeEventListener("support-requests-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [followups, inventory, invoices, jobs, quotes]);

  const activeJobs = useMemo(() => jobRecords.filter(isActiveJob), [jobRecords]);
  const dueTodayJobs = useMemo(() => activeJobs.filter(isDueToday), [activeJobs]);
  const highPriorityJobs = useMemo(() => activeJobs.filter((job) => job.priority === "High"), [activeJobs]);
  const waitingPartsJobs = useMemo(() => activeJobs.filter((job) => job.status === "Waiting parts"), [activeJobs]);
  const inProgressJobs = useMemo(() => activeJobs.filter((job) => job.status === "In progress"), [activeJobs]);
  const readyJobs = useMemo(() => activeJobs.filter((job) => job.status === "Ready"), [activeJobs]);
  const newJobs = useMemo(() => activeJobs.filter((job) => job.status === "New" || job.owner === "Unassigned"), [activeJobs]);
  const lowStockItems = useMemo(() => inventoryRecords.filter((item) => item.quantity <= item.reorderLevel), [inventoryRecords]);
  const pendingQuotes = useMemo(() => quoteRecords.filter((quote) => quote.status === "Draft" || quote.status === "Sent"), [quoteRecords]);
  const openInvoices = useMemo(() => invoiceRecords.filter((invoice) => invoice.status === "Draft" || invoice.status === "Sent"), [invoiceRecords]);
  const dueFollowups = useMemo(() => followupRecords.filter(followupNeedsAction), [followupRecords]);
  const newRequests = useMemo(() => requestRecords.filter((request) => request.status === "New"), [requestRecords]);

  const selectedJobs = useMemo(() => {
    return activeJobs
      .filter((job) => matchesFilter(job, activeFilter))
      .sort((a, b) => priorityScore(b) - priorityScore(a) || a.reference.localeCompare(b.reference))
      .slice(0, 7);
  }, [activeFilter, activeJobs]);

  const statusCards = [
    {
      filter: "today" as const,
      label: "Due today",
      value: dueTodayJobs.length,
      hint: `${highPriorityJobs.filter(isDueToday).length} high priority`,
      tone: "blue",
      action: "Plan today",
      jobs: dueTodayJobs,
    },
    {
      filter: "waiting" as const,
      label: "Waiting parts",
      value: waitingPartsJobs.length,
      hint: `${lowStockItems.length} stock alerts`,
      tone: "amber",
      action: "Check parts",
      jobs: waitingPartsJobs,
    },
    {
      filter: "progress" as const,
      label: "In progress",
      value: inProgressJobs.length,
      hint: `${inProgressJobs.filter((job) => job.owner === "Omar").length} with Omar`,
      tone: "blue",
      action: "Update work",
      jobs: inProgressJobs,
    },
    {
      filter: "ready" as const,
      label: "Ready",
      value: readyJobs.length,
      hint: "Customer handover",
      tone: "green",
      action: "Follow up",
      jobs: readyJobs,
    },
    {
      filter: "new" as const,
      label: "New / unassigned",
      value: newJobs.length,
      hint: `${newRequests.length} website requests`,
      tone: "gray",
      action: "Triage",
      jobs: newJobs,
    },
  ];

  const activityFeed = useMemo(() => {
    const generated = [
      ...newRequests.slice(0, 2).map((request) => ({
        title: `${request.name} sent a ${request.issueType.toLowerCase()} request`,
        meta: request.createdAt,
      })),
      ...jobRecords.filter((job) => job.updatedAt === "Just now" || job.updatedAt.includes("minute")).slice(0, 2).map((job) => ({
        title: `${job.reference} is ${job.status.toLowerCase()}`,
        meta: `${job.customer} - ${job.updatedAt}`,
      })),
      ...quoteRecords.filter((quote) => quote.updatedAt === "Just now" || quote.updatedAt.includes("minute")).slice(0, 2).map((quote) => ({
        title: `Quote ${quote.reference} is ${quote.status.toLowerCase()}`,
        meta: `${quote.customer} - ${quote.updatedAt}`,
      })),
      ...followupRecords.filter((followup) => followup.lastAction).slice(0, 2).map((followup) => ({
        title: `${followup.id} follow-up updated`,
        meta: followup.lastAction || followup.customer,
      })),
    ];
    return generated.slice(0, 6);
  }, [followupRecords, jobRecords, newRequests, quoteRecords]);

  const paidRevenue = invoiceRecords.filter((invoice) => invoice.status === "Paid").reduce((total, invoice) => total + invoice.total, 0);
  const quotePipeline = pendingQuotes.reduce((total, quote) => total + quote.total, 0);
  const openInvoiceTotal = openInvoices.reduce((total, invoice) => total + invoice.total, 0);

  return (
    <div className="dashboard-console">
      <section className="dashboard-hero-panel">
        <div className="dashboard-hero-copy">
          <span>Operations</span>
          <h2>{activeJobs.length} active jobs need tracking</h2>
          <p>{dueTodayJobs.length} due today, {waitingPartsJobs.length} waiting on parts, and {dueFollowups.length} follow-ups need attention.</p>
          <div className="dashboard-hero-actions">
            <Link className="button button-small" href="/admin/jobs/new">New job</Link>
            <Link className="button button-ghost button-small" href="/admin/requests">Review requests</Link>
            <Link className="button button-ghost button-small" href="/admin/followups">Follow-ups</Link>
          </div>
        </div>
        <div className="dashboard-pulse">
          <div>
            <span>Open invoice work</span>
            <strong>{money(openInvoiceTotal)}</strong>
          </div>
          <div>
            <span>Quote pipeline</span>
            <strong>{money(quotePipeline)}</strong>
          </div>
          <div>
            <span>Paid invoice total</span>
            <strong>{money(paidRevenue)}</strong>
          </div>
        </div>
      </section>

      <section className="status-board" aria-label="Job status panels">
        {statusCards.map((card) => (
          <button
            aria-pressed={activeFilter === card.filter}
            className={`status-card ${activeFilter === card.filter ? "active" : ""}`}
            data-tone={card.tone}
            key={card.filter}
            onClick={() => setActiveFilter(card.filter)}
            type="button"
          >
            <span className="status-card-kicker">{card.action}</span>
            <strong>{card.label}</strong>
            <b>{card.value}</b>
              <small>{card.hint}</small>
            <span className="status-progress"><i style={{ width: `${Math.min(100, (card.value / Math.max(1, activeJobs.length)) * 100)}%` }} /></span>
            <span className="status-card-list">
              {card.jobs.slice(0, 2).map((job) => (
                <span key={job.reference}>{job.reference} - {job.customer}</span>
              ))}
              {card.jobs.length === 0 && <span>No matching jobs</span>}
            </span>
          </button>
        ))}
      </section>

      <section className="dashboard-grid dashboard-ops-grid">
        <article className="admin-card dashboard-work-card">
          <div className="card-head dashboard-card-head">
            <div>
              <h2>{statusLabel(activeFilter)}</h2>
              <small>{selectedJobs.length} jobs in this view</small>
            </div>
            <div className="dashboard-filter-buttons">
              <button className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")} type="button">All</button>
              <button className={activeFilter === "high" ? "active" : ""} onClick={() => setActiveFilter("high")} type="button">High</button>
              <Link href="/admin/jobs">Jobs</Link>
            </div>
          </div>
          <div className="dashboard-job-list">
            {selectedJobs.map((job) => {
              const action = jobAction(job);
              return (
                <div className="dashboard-job-row" key={job.reference}>
                  <div>
                    <strong>{job.reference}</strong>
                    <span>{job.customer}</span>
                  </div>
                  <div>
                    <b>{job.device}</b>
                    <small>{job.issue}</small>
                  </div>
                  <span className={`pill ${job.tone}`}>{job.status}</span>
                  <div className="dashboard-next-action">
                    <strong>{action.label}</strong>
                    <small>{action.detail}</small>
                  </div>
                  <Link className="table-link" href={action.href}>Open</Link>
                </div>
              );
            })}
            {selectedJobs.length === 0 && <div className="empty-note">No jobs match this dashboard view.</div>}
          </div>
        </article>

        <article className="admin-card dashboard-side-card">
          <div className="card-head dashboard-card-head">
            <div>
              <h2>Recent activity</h2>
              <small>Latest operational movement</small>
            </div>
            <Link href="/admin/reports">Reports</Link>
          </div>
          <ul className="activity dashboard-activity">
            {activityFeed.map((item) => (
              <li key={`${item.title}-${item.meta}`}>
                <b>{item.title}</b>
                <small>{item.meta}</small>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="dashboard-secondary-grid">
        <article className="admin-card dashboard-insight-card">
          <div className="card-head dashboard-card-head">
            <div>
              <h2>Money</h2>
              <small>Quotes, invoices, and paid work</small>
            </div>
            <Link href="/admin/invoices">Invoices</Link>
          </div>
          <dl className="dashboard-compact-list">
            <div><dt>Pending quotes</dt><dd>{pendingQuotes.length}<small>{money(quotePipeline)}</small></dd></div>
            <div><dt>Draft / sent invoices</dt><dd>{openInvoices.length}<small>{money(openInvoiceTotal)}</small></dd></div>
            <div><dt>Paid records</dt><dd>{invoiceRecords.filter((invoice) => invoice.status === "Paid").length}<small>{money(paidRevenue)}</small></dd></div>
          </dl>
        </article>

        <article className="admin-card dashboard-insight-card">
          <div className="card-head dashboard-card-head">
            <div>
              <h2>Customer care</h2>
              <small>Requests and reminders</small>
            </div>
            <Link href="/admin/followups">Follow-ups</Link>
          </div>
          <dl className="dashboard-compact-list">
            <div><dt>Due follow-ups</dt><dd>{dueFollowups.length}<small>{dueFollowups.slice(0, 1).map((item) => item.customer).join("") || "Clear"}</small></dd></div>
            <div><dt>New website requests</dt><dd>{newRequests.length}<small>{newRequests.slice(0, 1).map((item) => item.name).join("") || "Clear"}</small></dd></div>
            <div><dt>Ready handovers</dt><dd>{readyJobs.length}<small>{readyJobs.slice(0, 1).map((item) => item.customer).join("") || "None waiting"}</small></dd></div>
          </dl>
        </article>

        <article className="admin-card dashboard-insight-card">
          <div className="card-head dashboard-card-head">
            <div>
              <h2>Stock watch</h2>
              <small>Parts and equipment availability</small>
            </div>
            <Link href="/admin/inventory">Inventory</Link>
          </div>
          <div className="dashboard-stock-list">
            {lowStockItems.slice(0, 4).map((item) => (
              <div key={item.sku}>
                <strong>{item.name}</strong>
                <span>{item.quantity} available / reorder at {item.reorderLevel}</span>
              </div>
            ))}
            {lowStockItems.length === 0 && <div className="dashboard-clear-state">Stock levels look healthy.</div>}
          </div>
        </article>
      </section>

      <section className="quick-actions dashboard-actions">
        <Link className="quick" href="/admin/jobs/new">New job<small>Create repair or support job</small></Link>
        <Link className="quick" href="/admin/requests">Support requests<small>Review website enquiries</small></Link>
        <Link className="quick" href="/admin/quotes/new">Quote<small>Prepare a customer quote</small></Link>
        <Link className="quick" href="/admin/inventory/new">Inventory<small>Add parts or equipment</small></Link>
      </section>
    </div>
  );
}
