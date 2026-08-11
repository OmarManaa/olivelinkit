"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jobs as seedJobs, type Job, type JobHistoryEntry } from "./admin-data";
import { historyForJob, readJobs, saveJobRecord } from "./jobs-store";

type JobRecordFormProps = {
  jobReference: string;
  initialJob?: Job;
};

function blankJob(reference: string): Job {
  return {
    reference,
    customer: "",
    device: "",
    issue: "",
    status: "New",
    tone: "gray",
    priority: "Normal",
    serviceType: "Workshop repair",
    owner: "Unassigned",
    dueAt: "Today",
    updatedAt: "Just now",
  };
}

export function JobRecordForm({ jobReference, initialJob }: JobRecordFormProps) {
  const router = useRouter();
  const [job, setJob] = useState<Job>(initialJob ?? blankJob(jobReference));
  const [historyType, setHistoryType] = useState("Progress note");
  const [historyNote, setHistoryNote] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedJob = readJobs(seedJobs).find((record) => record.reference === jobReference);
      setJob(savedJob ?? initialJob ?? blankJob(jobReference));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialJob, jobReference]);

  function update<Key extends keyof Job>(field: Key, value: Job[Key]) {
    setJob((current) => ({ ...current, [field]: value }));
  }

  function jobInput(historyEntry?: { note: string; type: string }) {
    return {
      reference: job.reference,
      customer: job.customer.trim(),
      email: job.email,
      phone: job.phone,
      customerId: job.customerId,
      device: job.device.trim() || "Device pending",
      issue: job.issue.trim(),
      status: job.status,
      priority: job.priority,
      serviceType: job.serviceType,
      owner: job.owner.trim() || "Unassigned",
      dueAt: job.dueAt.trim() || "Today",
      completedAt: job.completedAt,
      archivedAt: job.archivedAt,
      resolutionSummary: job.resolutionSummary,
      billingStatus: job.billingStatus,
      invoiceReference: job.invoiceReference,
      history: job.history,
      historyEntry: historyEntry ? {
        ...historyEntry,
        author: job.owner.trim() || "Omar",
        status: job.status,
      } : undefined,
    };
  }

  function canSave() {
    if (!job.customer.trim() || !job.issue.trim()) {
      setNotice("Add the customer and issue before saving the job.");
      return false;
    }
    return true;
  }

  function save() {
    if (!canSave()) {
      return;
    }
    saveJobRecord(jobInput());
    router.push("/admin/jobs");
  }

  function addHistoryNote() {
    if (!historyNote.trim()) {
      setNotice("Write the note before adding it to the job history.");
      return;
    }
    if (!canSave()) return;
    const saved = saveJobRecord(jobInput({ type: historyType, note: historyNote.trim() }));
    setJob(saved);
    setHistoryNote("");
    setNotice("History note saved with date and time.");
  }

  function historyDate(entry: JobHistoryEntry) {
    const date = new Date(entry.at);
    return Number.isNaN(date.getTime()) ? entry.at || "Earlier" : date.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });
  }

  const history = historyForJob(job);

  return (
    <form className="admin-form quote-form">
      <label>
        <span>Job reference</span>
        <input readOnly value={job.reference} />
      </label>
      <label>
        <span>Status</span>
        <select onChange={(event) => update("status", event.target.value)} value={job.status}>
          <option>New</option>
          <option>In progress</option>
          <option>Waiting parts</option>
          <option>Quote sent</option>
          <option>Ready</option>
          <option>Completed</option>
        </select>
      </label>
      <label>
        <span>Customer</span>
        <input onChange={(event) => update("customer", event.target.value)} value={job.customer} />
      </label>
      <label>
        <span>Device or system</span>
        <input onChange={(event) => update("device", event.target.value)} value={job.device} />
      </label>
      <label>
        <span>Priority</span>
        <select onChange={(event) => update("priority", event.target.value)} value={job.priority}>
          <option>Low</option>
          <option>Normal</option>
          <option>High</option>
        </select>
      </label>
      <label>
        <span>Service type</span>
        <select onChange={(event) => update("serviceType", event.target.value)} value={job.serviceType}>
          <option>Remote support</option>
          <option>Workshop repair</option>
          <option>Business onsite</option>
          <option>Equipment setup</option>
        </select>
      </label>
      <label>
        <span>Owner</span>
        <input onChange={(event) => update("owner", event.target.value)} value={job.owner} />
      </label>
      <label>
        <span>Due</span>
        <input onChange={(event) => update("dueAt", event.target.value)} value={job.dueAt} />
      </label>
      <label className="full">
        <span>Issue and work notes</span>
        <textarea onChange={(event) => update("issue", event.target.value)} rows={6} value={job.issue} />
      </label>
      <section className="job-history-panel full">
        <header>
          <div>
            <span>Activity history</span>
            <strong>{history.length} saved update{history.length === 1 ? "" : "s"}</strong>
          </div>
          <small>Use this for parts delays, supplier ETA, customer updates, diagnosis notes, and work completed.</small>
        </header>
        <div className="job-history-entry-form">
          <label>
            <span>Update type</span>
            <select value={historyType} onChange={(event) => setHistoryType(event.target.value)}>
              <option>Progress note</option>
              <option>Waiting parts</option>
              <option>Parts ordered</option>
              <option>Customer update</option>
              <option>Diagnosis</option>
              <option>Internal note</option>
            </select>
          </label>
          <label>
            <span>New note</span>
            <textarea value={historyNote} onChange={(event) => setHistoryNote(event.target.value)} placeholder="e.g. Waiting on replacement screen from supplier, ETA Friday 2pm." rows={3} />
          </label>
          <button className="button button-ghost" onClick={addHistoryNote} type="button">Add note to history</button>
        </div>
        <div className="job-history-list">
          {history.map((entry) => (
            <article key={entry.id}>
              <div>
                <strong>{entry.type}</strong>
                <span>{historyDate(entry)}{entry.author ? ` - ${entry.author}` : ""}{entry.status ? ` - ${entry.status}` : ""}</span>
              </div>
              <p>{entry.note}</p>
            </article>
          ))}
          {history.length === 0 && <div className="empty-note">No job history recorded yet.</div>}
        </div>
      </section>
      {notice && <div className="workflow-notice full">{notice}</div>}
      <div className="form-actions">
        <Link className="button button-ghost" href="/admin/jobs">Cancel</Link>
        <button className="button" onClick={save} type="button">Save job</button>
      </div>
    </form>
  );
}
