"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { customers, jobs, quotes } from "../../admin-data";
import { CustomerRecordForm } from "../../customer-record-form";
import { readCustomerAndProspectRecords } from "../../customers-store";
import { InventoryItemForm } from "../../inventory-item-form";
import { updateSupportRequestStatus } from "../../../support-requests-store";
import { readSupportRequests, type SupportRequest } from "../../../support-requests-store";
import { saveFollowupRecord } from "../../followups-store";
import { createManualInvoiceRecord } from "../../invoices-store";
import { readJobs, saveJobRecord, serviceTypeFor } from "../../jobs-store";
import { readQuoteDrafts, saveQuoteDraft } from "../../quotes-store";

type AdminRecordFormProps = {
  section: string;
  fields: string[];
};

const customerSections = new Set(["jobs", "quotes", "invoices", "followups"]);

type RelatedRecordOption = {
  value: string;
  label: string;
};

export function AdminRecordForm({ section, fields }: AdminRecordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceCustomer = searchParams.get("customer") ?? "";
  const sourceEmail = searchParams.get("email") ?? "";
  const sourcePhone = searchParams.get("phone") ?? "";
  const sourceJobRef = searchParams.get("jobRef") ?? "";
  const sourceDevice = searchParams.get("device") ?? "";
  const sourcePriority = searchParams.get("priority") ?? "";
  const sourceServiceType = searchParams.get("serviceType") ?? "";
  const sourceDetails = searchParams.get("details") ?? "";
  const sourceIssueType = searchParams.get("issueType") ?? "";
  const requestId = searchParams.get("requestId") ?? "";
  const draftRef = searchParams.get("draftRef") ?? "";
  const sourceExpiry = searchParams.get("expiresAt") ?? "";
  const sourceQuantity = searchParams.get("quantity") ?? "";
  const sourceUnitPrice = searchParams.get("unitPrice") ?? "";
  const [customerRecords, setCustomerRecords] = useState(customers);
  const [jobRecords, setJobRecords] = useState(jobs);
  const [quoteRecords, setQuoteRecords] = useState(quotes);
  const [requestRecords, setRequestRecords] = useState<SupportRequest[]>([]);

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
  }, []);

  useEffect(() => {
    const refresh = () => {
      setJobRecords(readJobs(jobs));
      const savedQuotes = readQuoteDrafts();
      const savedReferences = new Set(savedQuotes.map((quote) => quote.reference));
      setQuoteRecords([...savedQuotes, ...quotes.filter((quote) => !savedReferences.has(quote.reference))]);
      setRequestRecords(readSupportRequests());
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("jobs-updated", refresh);
    window.addEventListener("quote-drafts-updated", refresh);
    window.addEventListener("support-requests-updated", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("jobs-updated", refresh);
      window.removeEventListener("quote-drafts-updated", refresh);
      window.removeEventListener("support-requests-updated", refresh);
    };
  }, []);

  const customerOptions = useMemo(() => {
    const existing = customerRecords.map((customer) => ({ name: customer.name, type: customer.type, summary: customer.devices, status: customer.status }));
    if (!sourceCustomer || existing.some((customer) => customer.name === sourceCustomer)) return existing;
    return [{ name: sourceCustomer, type: "Pending", summary: [sourceEmail, sourcePhone].filter(Boolean).join(" - ") || "New website request", status: requestId || sourceIssueType || "Not converted yet" }, ...existing];
  }, [customerRecords, requestId, sourceCustomer, sourceEmail, sourceIssueType, sourcePhone]);

  const defaultExpiry = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().slice(0, 10);
  }, []);

  const [customerName, setCustomerName] = useState(sourceCustomer || customerOptions[0]?.name || "");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [quoteItem, setQuoteItem] = useState(sourceDetails || "");
  const [quantity, setQuantity] = useState(sourceQuantity || "1");
  const [unitPrice, setUnitPrice] = useState(sourceUnitPrice || "0");
  const [expiryDate, setExpiryDate] = useState(sourceExpiry && /^\d{4}-\d{2}-\d{2}$/.test(sourceExpiry) ? sourceExpiry : defaultExpiry);
  const contactNotes = [sourceEmail ? `Email: ${sourceEmail}` : "", sourcePhone ? `Mobile: ${sourcePhone}` : ""].filter(Boolean).join("\n");
  const [notes, setNotes] = useState(sourceDetails ? `Converted from ${requestId || "support request"} (${sourceIssueType}).${contactNotes ? `\n\nCustomer contact:\n${contactNotes}` : ""}\n\nCustomer request:\n${sourceDetails}` : "");

  const selectedCustomer = useMemo(() => {
    return customerOptions.find((customer) => customer.name === customerName);
  }, [customerName, customerOptions]);

  const relatedRecordOptions = useMemo(() => {
    const records = new Map<string, RelatedRecordOption>();
    for (const job of jobRecords) {
      records.set(job.reference, { value: job.reference, label: `Job - ${job.customer} - ${job.issue}` });
    }
    for (const quote of quoteRecords) {
      records.set(quote.reference, { value: quote.reference, label: `Quote - ${quote.customer} - ${quote.title}` });
    }
    for (const request of requestRecords) {
      records.set(request.id, { value: request.id, label: `Request - ${request.name} - ${request.issueType}` });
    }
    return Array.from(records.values()).sort((left, right) => left.value.localeCompare(right.value));
  }, [jobRecords, quoteRecords, requestRecords]);

  const showCustomerLookup = customerSections.has(section);
  const visibleFields = showCustomerLookup ? fields.filter((field) => field !== "Customer") : fields;

  function initialValue(label: string) {
    if (label === "Description" || label === "Issue") return sourceDetails;
    if (label === "Device") return sourceDevice;
    if (label === "Priority") return sourcePriority;
    if (label === "Related job" && requestId) return requestId;
    if (label === "Related record" && requestId) return requestId;
    if (label === "Quantity") return sourceQuantity || "1";
    if (label === "Unit price") return sourceUnitPrice || "0";
    if (label === "Channel") return "Email";
    if (label === "Owner") return "Omar";
    if (label === "Status") return "Scheduled";
    return "";
  }

  function valueFor(label: string) {
    return fieldValues[label] ?? initialValue(label);
  }

  function saveDraft() {
    if (section === "quotes") {
      saveQuoteDraft({
        reference: draftRef || undefined,
        customer: customerName,
        email: sourceEmail,
        phone: sourcePhone,
        relatedJob: valueFor("Related job"),
        title: quoteItem,
        expiresAt: expiryDate,
        quantity: Number(quantity) || 1,
        unitPrice: Number(unitPrice) || 0,
        notes,
      });
      if (requestId.startsWith("REQ-")) updateSupportRequestStatus(requestId, "Follow-up");
    }
    if (section === "jobs") {
      saveJobRecord({
        reference: sourceJobRef || undefined,
        customer: customerName,
        email: sourceEmail,
        phone: sourcePhone,
        device: valueFor("Device") || "Device pending",
        issue: valueFor("Issue") || sourceDetails || "New support job",
        priority: valueFor("Priority") || "Normal",
        serviceType: sourceServiceType || (sourceIssueType ? serviceTypeFor(sourceIssueType) : "Workshop repair"),
      });
    }
    if (section === "invoices") {
      const quantity = Number(valueFor("Quantity")) || 1;
      const unitPrice = Number(valueFor("Unit price")) || 0;
      createManualInvoiceRecord({
        customer: customerName,
        relatedJob: valueFor("Related job") || requestId || "Not linked",
        description: valueFor("Description") || "Invoice line item",
        quantity,
        unitPrice,
        notes,
      });
    }
    if (section === "followups") {
      saveFollowupRecord({
        customer: customerName,
        reason: valueFor("Reason") || notes || "Follow up with customer",
        related: valueFor("Related record") || requestId || "Not linked",
        dueAt: valueFor("Due date") || "Tomorrow",
        channel: (valueFor("Channel") || "Email") as "WhatsApp" | "Email" | "Phone",
        owner: valueFor("Owner") || "Omar",
        status: (valueFor("Status") || "Scheduled") as "Planned" | "Scheduled" | "Due" | "Waiting" | "Overdue" | "Completed",
        outcome: notes || undefined,
      });
    }
    router.push(`/admin/${section}`);
  }

  function fieldControl(label: string) {
    if (label === "Related job" || label === "Related record") {
      return <input list="related-record-options" onChange={(event) => setFieldValues((current) => ({ ...current, [label]: event.target.value }))} placeholder="Search or type a job, quote, or request ID" type="search" value={valueFor(label)} />;
    }
    if (label === "Channel") {
      return (
        <select onChange={(event) => setFieldValues((current) => ({ ...current, [label]: event.target.value }))} value={valueFor(label)}>
          <option>Email</option>
          <option>WhatsApp</option>
          <option>Phone</option>
        </select>
      );
    }
    if (label === "Status") {
      return (
        <select onChange={(event) => setFieldValues((current) => ({ ...current, [label]: event.target.value }))} value={valueFor(label)}>
          <option>Planned</option>
          <option>Scheduled</option>
          <option>Due</option>
          <option>Waiting</option>
          <option>Overdue</option>
          <option>Completed</option>
        </select>
      );
    }
    return <input onChange={(event) => setFieldValues((current) => ({ ...current, [label]: event.target.value }))} value={valueFor(label)} placeholder={label} />;
  }

  if (section === "customers") {
    return <CustomerRecordForm />;
  }

  if (section === "quotes") {
    const subtotal = (Number(quantity) || 0) * (Number(unitPrice) || 0);
    const gst = subtotal * 0.1;
    const total = subtotal + gst;

    return (
      <form className="admin-form quote-form">
        <label>
          <span>Customer or prospect</span>
          <select value={customerName} onChange={(event) => setCustomerName(event.target.value)}>
            {customerOptions.map((customer) => <option key={customer.name} value={customer.name}>{customer.name} - {customer.type}</option>)}
          </select>
        </label>
        {selectedCustomer && (
          <div className="lookup-summary">
            <span>Customer record</span>
            <strong>{selectedCustomer.name}</strong>
            <small>{selectedCustomer.summary} - {selectedCustomer.status}</small>
          </div>
        )}
        <label>
          <span>Related job or request</span>
          <input list="related-record-options" onChange={(event) => setFieldValues((current) => ({ ...current, "Related job": event.target.value }))} placeholder="Search or type a job, quote, or request ID" type="search" value={valueFor("Related job")} />
        </label>
        <datalist id="related-record-options">
          {relatedRecordOptions.map((record) => <option key={record.value} label={record.label} value={record.value} />)}
        </datalist>
        <label>
          <span>Expiry date</span>
          <input onChange={(event) => setExpiryDate(event.target.value)} type="date" value={expiryDate} />
        </label>
        <div className="quote-lines">
          <div className="quote-lines-head"><h2>Quote line</h2><span>GST calculated at 10%</span></div>
          <div className="quote-line">
            <label>
              <span>Description</span>
              <input onChange={(event) => setQuoteItem(event.target.value)} value={quoteItem} placeholder="Labour, part, or service description" />
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
          <div><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
          <div><span>GST</span><strong>${gst.toFixed(2)}</strong></div>
          <div><span>Total</span><strong>${total.toFixed(2)}</strong></div>
        </section>
        <label className="full">
          <span>Notes</span>
          <textarea onChange={(event) => setNotes(event.target.value)} placeholder="Customer-facing notes or internal quote notes" rows={5} value={notes} />
        </label>
        <div className="form-actions">
          <Link className="button button-ghost" href="/admin/quotes">Cancel</Link>
          <button className="button" onClick={saveDraft} type="button">Save draft</button>
        </div>
      </form>
    );
  }

  if (section === "inventory" || section === "equipment") {
    return <InventoryItemForm mode={section} />;
  }

  return (
    <form className="admin-form">
      <datalist id="related-record-options">
        {relatedRecordOptions.map((record) => <option key={record.value} label={record.label} value={record.value} />)}
      </datalist>
      {showCustomerLookup && (
        <>
          <label>
            <span>Customer or prospect</span>
            <select value={customerName} onChange={(event) => setCustomerName(event.target.value)}>
              {customerOptions.map((customer) => <option key={customer.name} value={customer.name}>{customer.name} - {customer.type}</option>)}
            </select>
          </label>
          {selectedCustomer && (
            <div className="lookup-summary">
              <span>Customer record</span>
              <strong>{selectedCustomer.name}</strong>
              <small>{selectedCustomer.summary} - {selectedCustomer.status}</small>
            </div>
          )}
        </>
      )}
      {visibleFields.map((label) => (
        <label key={label}>
          <span>{label}</span>
          {fieldControl(label)}
        </label>
      ))}
      <label className="full">
        <span>Notes</span>
        <textarea onChange={(event) => setNotes(event.target.value)} placeholder="Internal notes" rows={5} value={notes} />
      </label>
      <div className="form-actions">
        <Link className="button button-ghost" href={`/admin/${section}`}>Cancel</Link>
        <button className="button" onClick={saveDraft} type="button">Save draft</button>
      </div>
    </form>
  );
}
