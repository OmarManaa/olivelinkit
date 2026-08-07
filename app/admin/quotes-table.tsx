"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Quote } from "./admin-data";
import { readQuoteDrafts } from "./quotes-store";

type QuotesTableProps = {
  quotes: Quote[];
};

const formatMoney = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function QuotesTable({ quotes }: QuotesTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [drafts, setDrafts] = useState<Quote[]>([]);

  useEffect(() => {
    const refresh = () => setDrafts(readQuoteDrafts());
    refresh();
    window.addEventListener("quote-drafts-updated", refresh);
    return () => window.removeEventListener("quote-drafts-updated", refresh);
  }, []);

  const allQuotes = useMemo(() => {
    const draftReferences = new Set(drafts.map((draft) => draft.reference));
    return [...drafts, ...quotes.filter((quote) => !draftReferences.has(quote.reference))];
  }, [drafts, quotes]);

  const statuses = useMemo(() => Array.from(new Set(allQuotes.map((quote) => quote.status))).sort(), [allQuotes]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allQuotes.filter((quote) => {
      const matchesQuery = !needle || [quote.reference, quote.customer, quote.relatedJob, quote.title].some((value) => value.toLowerCase().includes(needle));
      const matchesStatus = status === "all" || quote.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [allQuotes, query, status]);

  return (
    <section className="work-panel">
      <div className="work-toolbar quote-toolbar">
        <label className="search-field">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search quote, customer, job, work" />
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
        <strong>{filtered.length}</strong> shown from {allQuotes.length} quotes
        <span>{allQuotes.filter((quote) => quote.status === "Draft").length} drafts</span>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Quote</th>
              <th>Customer</th>
              <th>Related job</th>
              <th>Status</th>
              <th>Subtotal</th>
              <th>GST</th>
              <th>Total</th>
              <th>Expiry</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((quote) => (
              <tr key={quote.reference}>
                <td><strong>{quote.title}</strong><small>{quote.reference}</small></td>
                <td>{quote.customer}</td>
                <td>{quote.relatedJob}</td>
                <td><span className={`pill ${quote.tone}`}>{quote.status}</span></td>
                <td>{formatMoney(quote.subtotal)}</td>
                <td>{formatMoney(quote.gst)}</td>
                <td><strong>{formatMoney(quote.total)}</strong></td>
                <td>{quote.expiresAt}</td>
                <td>{quote.updatedAt}</td>
                <td className="table-actions">
                  <Link className="table-link" href={drafts.some((draft) => draft.reference === quote.reference) ? `/admin/quotes/new?draftRef=${encodeURIComponent(quote.reference)}&customer=${encodeURIComponent(quote.customer)}&requestId=${encodeURIComponent(quote.relatedJob)}&details=${encodeURIComponent(quote.title)}&expiresAt=${encodeURIComponent(quote.expiresAt)}&quantity=${encodeURIComponent(String(quote.items[0]?.quantity ?? 1))}&unitPrice=${encodeURIComponent(String(quote.items[0]?.unitPrice ?? 0))}` : `/admin/quotes/${quote.reference}/edit`}>Edit</Link>
                  <Link className="table-link" href={`/admin/quotes/send?reference=${encodeURIComponent(quote.reference)}`}>Send</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty-note">No quotes match the current filters.</div>}
    </section>
  );
}
