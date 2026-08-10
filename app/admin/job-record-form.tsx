"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jobs as seedJobs, type Job } from "./admin-data";
import { readJobs, saveJobRecord } from "./jobs-store";

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

  function save() {
    if (!job.customer.trim() || !job.issue.trim()) {
      setNotice("Add the customer and issue before saving the job.");
      return;
    }
    saveJobRecord({
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
    });
    router.push("/admin/jobs");
  }

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
      {notice && <div className="workflow-notice full">{notice}</div>}
      <div className="form-actions">
        <Link className="button button-ghost" href="/admin/jobs">Cancel</Link>
        <button className="button" onClick={save} type="button">Save job</button>
      </div>
    </form>
  );
}
