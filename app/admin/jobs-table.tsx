"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Job } from "./admin-data";
import { readJobs, readSavedJobs } from "./jobs-store";

type JobsTableProps = {
  jobs: Job[];
};

export function JobsTable({ jobs }: JobsTableProps) {
  const [allJobs, setAllJobs] = useState<Job[]>(jobs);
  const [savedReferences, setSavedReferences] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  useEffect(() => {
    const refresh = () => {
      const savedJobs = readSavedJobs();
      setSavedReferences(new Set(savedJobs.map((job) => job.reference)));
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
    if (!savedReferences.has(job.reference)) return `/admin/jobs/${job.reference}/edit`;
    const params = new URLSearchParams({
      jobRef: job.reference,
      customer: job.customer,
      device: job.device,
      details: job.issue,
      priority: job.priority,
      serviceType: job.serviceType,
    });
    return `/admin/jobs/new?${params.toString()}`;
  }

  const statuses = useMemo(() => Array.from(new Set(allJobs.map((job) => job.status))).sort(), [allJobs]);
  const priorities = useMemo(() => Array.from(new Set(allJobs.map((job) => job.priority))).sort(), [allJobs]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allJobs.filter((job) => {
      const matchesQuery = !needle || [job.reference, job.customer, job.device, job.issue, job.serviceType].some((value) => value.toLowerCase().includes(needle));
      const matchesStatus = status === "all" || job.status === status;
      const matchesPriority = priority === "all" || job.priority === priority;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [allJobs, priority, query, status]);

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
      </div>
      <div className="table-summary">
        <strong>{filtered.length}</strong> shown from {allJobs.length} jobs
        <span>{allJobs.filter((job) => job.priority === "High" && job.status !== "Completed").length} high-priority open</span>
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
                <td>{job.issue}</td>
                <td><span className={`pill ${job.tone}`}>{job.status}</span></td>
                <td><span className={job.priority === "High" ? "stock-low" : ""}>{job.priority}</span></td>
                <td>{job.serviceType}</td>
                <td>{job.dueAt}</td>
                <td>{job.owner}</td>
                <td>{job.updatedAt}</td>
                <td><Link className="table-link" href={actionHref(job)}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty-note">No jobs match the current filters.</div>}
    </section>
  );
}
