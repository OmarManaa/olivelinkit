"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Followup } from "./admin-data";

type FollowupsTableProps = {
  followups: Followup[];
};

export function FollowupsTable({ followups }: FollowupsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const statuses = useMemo(() => Array.from(new Set(followups.map((item) => item.status))).sort(), [followups]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return followups.filter((item) => {
      const matchesQuery = !needle || [item.customer, item.reason, item.related, item.channel].some((value) => value.toLowerCase().includes(needle));
      const matchesStatus = status === "all" || item.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [followups, query, status]);

  return (
    <section className="work-panel">
      <div className="work-toolbar quote-toolbar">
        <label className="search-field">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, reason, job, quote, channel" />
        </label>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>
      <div className="table-summary">
        <strong>{filtered.length}</strong> shown from {followups.length} follow-ups
        <span>{followups.filter((item) => item.status === "Due").length} due today</span>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Reason</th>
              <th>Related</th>
              <th>Due</th>
              <th>Channel</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.customer}</strong><small>{item.id}</small></td>
                <td>{item.reason}</td>
                <td>{item.related}</td>
                <td>{item.dueAt}</td>
                <td>{item.channel}</td>
                <td>{item.owner}</td>
                <td><span className={`pill ${item.tone}`}>{item.status}</span></td>
                <td><Link className="table-link" href={`/admin/followups/${item.id}/edit`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty-note">No follow-ups match the current filters.</div>}
    </section>
  );
}
