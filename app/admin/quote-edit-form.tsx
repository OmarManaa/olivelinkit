"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Customer, Job, Quote } from "./admin-data";
import { readCustomerAndProspectRecords } from "./customers-store";
import { saveQuoteDraft } from "./quotes-store";

type QuoteEditFormProps = {
  quote: Quote;
  customers: Customer[];
  jobs: Job[];
};

function toDateInput(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? "" : new Date(parsed).toISOString().slice(0, 10);
}

function toneForStatus(status: Quote["status"]): Quote["tone"] {
  if (status === "Accepted") return "green";
  if (status === "Sent") return "amber";
  if (status === "Rejected" || status === "Expired") return "gray";
  return "gray";
}

export function QuoteEditForm({ quote, customers, jobs }: QuoteEditFormProps) {
  const router = useRouter();
  const firstItem = quote.items[0] ?? { description: quote.title, quantity: 1, unitPrice: 0 };
  const [customer, setCustomer] = useState(quote.customer);
  const [relatedJob, setRelatedJob] = useState(quote.relatedJob);
  const [title, setTitle] = useState(firstItem.description || quote.title);
  const [quantity, setQuantity] = useState(String(firstItem.quantity));
  const [unitPrice, setUnitPrice] = useState(String(firstItem.unitPrice));
  const [expiresAt, setExpiresAt] = useState(toDateInput(quote.expiresAt));
  const [notes, setNotes] = useState("Customer-facing quote notes and internal preparation details.");
  const [status, setStatus] = useState<Quote["status"]>(quote.status);
  const [customerRecords, setCustomerRecords] = useState<Customer[]>(customers);

  useEffect(() => {
    const refresh = () => setCustomerRecords(readCustomerAndProspectRecords(customers));
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("customers-updated", refresh);
    window.addEventListener("prospects-updated", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("customers-updated", refresh);
      window.removeEventListener("prospects-updated", refresh);
    };
  }, [customers]);

  const totals = useMemo(() => {
    const subtotal = (Number(quantity) || 0) * (Number(unitPrice) || 0);
    const gst = subtotal * 0.1;
    return { subtotal, gst, total: subtotal + gst };
  }, [quantity, unitPrice]);

  function saveChanges() {
    saveQuoteDraft({
      reference: quote.reference,
      customer,
      relatedJob,
      title,
      expiresAt,
      quantity: Number(quantity) || 1,
      unitPrice: Number(unitPrice) || 0,
      notes,
      status,
      tone: toneForStatus(status),
    });
    router.push("/admin/quotes");
  }

  return (
    <form className="admin-form quote-form">
      <label>
        <span>Quote reference</span>
        <input readOnly value={quote.reference} />
      </label>
      <label>
        <span>Status</span>
        <select onChange={(event) => setStatus(event.target.value as Quote["status"])} value={status}>
          <option>Draft</option>
          <option>Sent</option>
          <option>Accepted</option>
          <option>Rejected</option>
          <option>Expired</option>
        </select>
      </label>
      <label>
        <span>Customer or prospect</span>
        <select onChange={(event) => setCustomer(event.target.value)} value={customer}>
          {!customerRecords.some((entry) => entry.name === customer) && <option value={customer}>{customer}</option>}
          {customerRecords.map((entry) => <option key={entry.id} value={entry.name}>{entry.name} - {entry.type}</option>)}
        </select>
      </label>
      <label>
        <span>Related job or request</span>
        <select onChange={(event) => setRelatedJob(event.target.value)} value={relatedJob}>
          <option value={quote.relatedJob}>{quote.relatedJob}</option>
          {jobs.map((job) => <option key={job.reference} value={job.reference}>{job.reference} - {job.issue}</option>)}
        </select>
      </label>
      <label>
        <span>Expiry date</span>
        <input onChange={(event) => setExpiresAt(event.target.value)} type="date" value={expiresAt} />
      </label>
      <div className="quote-lines">
        <div className="quote-lines-head"><h2>Quote line</h2><Link href="/admin/inventory">Add from inventory</Link></div>
        <div className="quote-line">
          <label>
            <span>Description</span>
            <input onChange={(event) => setTitle(event.target.value)} value={title} />
          </label>
          <label>
            <span>Qty</span>
            <input min="1" onChange={(event) => setQuantity(event.target.value)} type="number" value={quantity} />
          </label>
          <label>
            <span>Unit price</span>
            <input min="0" onChange={(event) => setUnitPrice(event.target.value)} type="number" value={unitPrice} />
          </label>
        </div>
      </div>
      <section className="quote-totals">
        <div><span>Subtotal</span><strong>${totals.subtotal.toFixed(2)}</strong></div>
        <div><span>GST</span><strong>${totals.gst.toFixed(2)}</strong></div>
        <div><span>Total</span><strong>${totals.total.toFixed(2)}</strong></div>
      </section>
      <label className="full">
        <span>Notes</span>
        <textarea onChange={(event) => setNotes(event.target.value)} rows={5} value={notes} />
      </label>
      <div className="form-actions">
        <Link className="button button-ghost" href="/admin/quotes">Cancel</Link>
        <Link className="button button-ghost" href={`/admin/quotes/send?reference=${encodeURIComponent(quote.reference)}`}>Send to customer</Link>
        <button className="button" onClick={saveChanges} type="button">Save draft</button>
      </div>
    </form>
  );
}
