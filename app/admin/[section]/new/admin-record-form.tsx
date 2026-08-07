"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { customers } from "../../admin-data";
import { InventoryItemForm } from "../../inventory-item-form";
import { saveJobRecord, serviceTypeFor } from "../../jobs-store";
import { saveQuoteDraft } from "../../quotes-store";

type AdminRecordFormProps = {
  section: string;
  fields: string[];
};

const customerSections = new Set(["jobs", "quotes", "followups"]);

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

  const customerOptions = useMemo(() => {
    const existing = customers.map((customer) => ({ name: customer.name, type: customer.type, summary: customer.devices, status: customer.status }));
    if (!sourceCustomer || existing.some((customer) => customer.name === sourceCustomer)) return existing;
    return [{ name: sourceCustomer, type: "Pending", summary: [sourceEmail, sourcePhone].filter(Boolean).join(" - ") || "New website request", status: requestId || sourceIssueType || "Not converted yet" }, ...existing];
  }, [requestId, sourceCustomer, sourceEmail, sourceIssueType, sourcePhone]);

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

  const showCustomerLookup = customerSections.has(section);
  const visibleFields = showCustomerLookup ? fields.filter((field) => field !== "Customer") : fields;

  function initialValue(label: string) {
    if (label === "Description" || label === "Issue") return sourceDetails;
    if (label === "Device") return sourceDevice;
    if (label === "Priority") return sourcePriority;
    if (label === "Related job" && requestId) return requestId;
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
    router.push(`/admin/${section}`);
  }

  if (section === "quotes") {
    const subtotal = (Number(quantity) || 0) * (Number(unitPrice) || 0);
    const gst = subtotal * 0.1;
    const total = subtotal + gst;

    return (
      <form className="admin-form quote-form">
        <label>
          <span>Customer</span>
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
          <input onChange={(event) => setFieldValues((current) => ({ ...current, "Related job": event.target.value }))} value={valueFor("Related job")} placeholder="Job, quote request, or support request ID" />
        </label>
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
      {showCustomerLookup && (
        <>
          <label>
            <span>Customer</span>
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
          <input onChange={(event) => setFieldValues((current) => ({ ...current, [label]: event.target.value }))} value={valueFor(label)} placeholder={label} />
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
