"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { customers as baseCustomers, type Customer, type Job } from "./admin-data";
import { findCustomerMatches, type CustomerMatches } from "./customers-store";
import { readJobs, resolveJobRecord } from "./jobs-store";

type JobsTableProps = {
  jobs: Job[];
};

type ResolveForm = {
  resolutionSummary: string;
  billingAction: "invoice" | "already-paid" | "no-charge";
  lineDescription: string;
  quantity: string;
  unitPrice: string;
  archiveAfter: boolean;
  customerMode: "auto-email" | "merge-existing" | "create-new";
  targetCustomerId: string;
};

function initialResolveForm(job: Job, matches?: CustomerMatches): ResolveForm {
  return {
    resolutionSummary: "",
    billingAction: "invoice",
    lineDescription: `${job.serviceType} - ${job.device}`,
    quantity: "1",
    unitPrice: "0",
    archiveAfter: true,
    customerMode: matches?.emailMatch ? "auto-email" : "create-new",
    targetCustomerId: matches?.emailMatch?.id ?? "",
  };
}

function customerContact(customer: Customer) {
  return [customer.email, customer.phone].filter((value) => value && value !== "Not captured").join(" - ") || "No contact saved";
}

function billingSummary(action: ResolveForm["billingAction"]) {
  if (action === "already-paid") return "Create a paid invoice record for your books.";
  if (action === "no-charge") return "Close the work with a zero-dollar no-charge record.";
  return "Create a draft invoice to send after review.";
}

export function JobsTable({ jobs }: JobsTableProps) {
  const [allJobs, setAllJobs] = useState<Job[]>(jobs);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [recordView, setRecordView] = useState("active");
  const [jobToResolve, setJobToResolve] = useState<Job | null>(null);
  const [resolveForm, setResolveForm] = useState<ResolveForm | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => {
      setAllJobs(readJobs(jobs));
    };
    refresh();
    window.addEventListener("jobs-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("jobs-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [jobs]);

  function actionHref(job: Job) {
    return `/admin/jobs/${encodeURIComponent(job.reference)}/edit`;
  }

  function refreshJobs() {
    setAllJobs(readJobs(jobs));
  }

  function openResolve(job: Job) {
    const matches = findCustomerMatches(job, baseCustomers);
    setJobToResolve(job);
    setResolveForm(initialResolveForm(job, matches));
    setNotice("");
  }

  function updateResolveForm(next: Partial<ResolveForm>) {
    setResolveForm((current) => current ? { ...current, ...next } : current);
  }

  function submitResolution() {
    if (!jobToResolve || !resolveForm) return;
    const customerDecision = {
      mode: resolveForm.customerMode,
      targetCustomerId: resolveForm.targetCustomerId || undefined,
    };
    const result = resolveJobRecord({
      job: jobToResolve,
      resolutionSummary: resolveForm.resolutionSummary,
      billingAction: resolveForm.billingAction,
      lineDescription: resolveForm.lineDescription,
      quantity: Number(resolveForm.quantity) || 1,
      unitPrice: Number(resolveForm.unitPrice) || 0,
      archiveAfter: resolveForm.archiveAfter,
      customerDecision,
    });
    refreshJobs();
    setJobToResolve(null);
    setResolveForm(null);
    setNotice(`${result.job.reference} completed. ${result.invoice.reference} created and ${result.customer.name} updated.`);
  }

  const statuses = useMemo(() => Array.from(new Set(allJobs.map((job) => job.status))).sort(), [allJobs]);
  const priorities = useMemo(() => Array.from(new Set(allJobs.map((job) => job.priority))).sort(), [allJobs]);
  const matches = useMemo(() => jobToResolve ? findCustomerMatches(jobToResolve, baseCustomers) : undefined, [jobToResolve]);
  const mergeOptions = useMemo(() => {
    if (!matches) return [];
    const seen = new Set<string>();
    return [...matches.phoneMatches, ...matches.nameMatches].filter((customer) => {
      if (seen.has(customer.id)) return false;
      seen.add(customer.id);
      return true;
    });
  }, [matches]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allJobs.filter((job) => {
      const matchesArchive = recordView === "all" || (recordView === "archived" ? Boolean(job.archivedAt) : !job.archivedAt);
      const matchesQuery = !needle || [job.reference, job.customer, job.device, job.issue, job.serviceType].some((value) => value.toLowerCase().includes(needle));
      const matchesStatus = status === "all" || job.status === status;
      const matchesPriority = priority === "all" || job.priority === priority;
      return matchesArchive && matchesQuery && matchesStatus && matchesPriority;
    });
  }, [allJobs, priority, query, recordView, status]);

  return (
    <section className="work-panel">
      <div className="work-toolbar jobs-toolbar">
        <label className="search-field">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search job, customer, device, issue" />
        </label>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>Priority</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="all">All priorities</option>
            {priorities.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>View</span>
          <select value={recordView} onChange={(event) => setRecordView(event.target.value)}>
            <option value="active">Active only</option>
            <option value="archived">Archived</option>
            <option value="all">All jobs</option>
          </select>
        </label>
      </div>
      {notice && <div className="workflow-notice">{notice}</div>}
      <div className="table-summary">
        <strong>{filtered.length}</strong> shown from {allJobs.length} jobs
        <span>{allJobs.filter((job) => job.priority === "High" && job.status !== "Completed" && !job.archivedAt).length} high-priority open</span>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Customer</th>
              <th>Device</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Service</th>
              <th>Due</th>
              <th>Owner</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => (
              <tr key={job.reference}>
                <td><strong>{job.reference}</strong><small>{job.serviceType}</small></td>
                <td>{job.customer}</td>
                <td>{job.device}</td>
                <td className="job-issue-cell">{job.issue}</td>
                <td><span className={`pill ${job.tone}`}>{job.status}</span></td>
                <td><span className={job.priority === "High" ? "stock-low" : ""}>{job.priority}</span></td>
                <td>{job.serviceType}</td>
                <td>{job.dueAt}</td>
                <td>{job.owner}</td>
                <td>{job.updatedAt}</td>
                <td className="table-actions">
                  <Link className="table-link" href={actionHref(job)}>Open</Link>
                  {!job.archivedAt && job.status !== "Completed" && <button className="table-link table-button" onClick={() => openResolve(job)} type="button">Resolve</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty-note">No jobs match the current filters.</div>}
      {jobToResolve && resolveForm && (
        <div className="resolve-panel">
          <div className="resolve-head">
            <div>
              <span>{jobToResolve.reference}</span>
              <h2>Resolve {jobToResolve.customer}</h2>
              <p>{jobToResolve.device} - {jobToResolve.serviceType}</p>
            </div>
            <button className="admin-action secondary" onClick={() => setJobToResolve(null)} type="button">Close</button>
          </div>
          <div className="resolve-grid">
            <label className="full">
              <span>What was fixed?</span>
              <textarea value={resolveForm.resolutionSummary} onChange={(event) => updateResolveForm({ resolutionSummary: event.target.value })} placeholder="Describe the work completed, parts used, advice given, and any follow-up needed." rows={4} />
            </label>
            <label>
              <span>Billing result</span>
              <select value={resolveForm.billingAction} onChange={(event) => updateResolveForm({ billingAction: event.target.value as ResolveForm["billingAction"] })}>
                <option value="invoice">Create draft invoice</option>
                <option value="already-paid">Already paid</option>
                <option value="no-charge">No charge</option>
              </select>
              <small>{billingSummary(resolveForm.billingAction)}</small>
            </label>
            <label>
              <span>Archive after resolving</span>
              <select value={resolveForm.archiveAfter ? "yes" : "no"} onChange={(event) => updateResolveForm({ archiveAfter: event.target.value === "yes" })}>
                <option value="yes">Yes, hide from active jobs</option>
                <option value="no">No, keep visible as completed</option>
              </select>
            </label>
            <label className="full">
              <span>Invoice line</span>
              <input value={resolveForm.lineDescription} onChange={(event) => updateResolveForm({ lineDescription: event.target.value })} placeholder="Labour, part, equipment, or service description" />
            </label>
            <label>
              <span>Quantity</span>
              <input min="1" type="number" value={resolveForm.quantity} onChange={(event) => updateResolveForm({ quantity: event.target.value })} />
            </label>
            <label>
              <span>Unit price</span>
              <input min="0" type="number" value={resolveForm.unitPrice} onChange={(event) => updateResolveForm({ unitPrice: event.target.value })} />
            </label>
            <div className="customer-match full">
              <span>Customer record</span>
              {matches?.emailMatch ? (
                <div className="match-card locked">
                  <strong>Auto-match by email: {matches.emailMatch.name}</strong>
                  <small>{customerContact(matches.emailMatch)}</small>
                </div>
              ) : mergeOptions.length > 0 ? (
                <div className="match-options">
                  <label>
                    <input checked={resolveForm.customerMode === "create-new"} onChange={() => updateResolveForm({ customerMode: "create-new", targetCustomerId: "" })} type="radio" />
                    <span><strong>Keep as new customer</strong><small>Use this if the shared mobile/name is not enough to confirm the same person.</small></span>
                  </label>
                  {mergeOptions.map((customer) => (
                    <label key={customer.id}>
                      <input checked={resolveForm.customerMode === "merge-existing" && resolveForm.targetCustomerId === customer.id} onChange={() => updateResolveForm({ customerMode: "merge-existing", targetCustomerId: customer.id })} type="radio" />
                      <span><strong>Merge with {customer.name}</strong><small>{customerContact(customer)}</small></span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="match-card">
                  <strong>Create new customer record</strong>
                  <small>No strong email or mobile match was found.</small>
                </div>
              )}
            </div>
          </div>
          <div className="resolve-actions">
            <button className="button button-ghost" onClick={() => setJobToResolve(null)} type="button">Cancel</button>
            <button className="button" onClick={submitResolution} type="button">Complete job</button>
          </div>
        </div>
      )}
    </section>
  );
}
