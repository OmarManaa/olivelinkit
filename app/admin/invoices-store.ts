"use client";

import type { Invoice, Job } from "./admin-data";

const STORAGE_KEY = "it-services-invoices";

type BillingAction = "invoice" | "already-paid" | "no-charge";

function invoiceReference(jobReference: string) {
  const digits = jobReference.replace(/\D/g, "");
  return `INV-${(digits || Date.now().toString()).slice(-5).padStart(5, "0")}`;
}

function invoiceStatus(action: BillingAction): Pick<Invoice, "status" | "tone"> {
  if (action === "no-charge") return { status: "No charge", tone: "gray" };
  if (action === "already-paid") return { status: "Paid", tone: "green" };
  return { status: "Draft", tone: "amber" };
}

function toneForStatus(status: Invoice["status"]): Invoice["tone"] {
  if (status === "Paid") return "green";
  if (status === "Sent") return "blue";
  if (status === "No charge") return "gray";
  return "amber";
}

export function readInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Invoice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveInvoiceRecord(invoice: Invoice) {
  const invoices = readInvoices();
  const merged = invoices.some((record) => record.reference === invoice.reference)
    ? invoices.map((record) => record.reference === invoice.reference ? invoice : record)
    : [invoice, ...invoices];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event("invoices-updated"));
  return invoice;
}

export function updateInvoiceStatus(reference: string, status: Invoice["status"]) {
  const invoice = readInvoices().find((record) => record.reference === reference);
  if (!invoice) return null;
  return saveInvoiceRecord({
    ...invoice,
    status,
    tone: toneForStatus(status),
    updatedAt: "Just now",
  });
}

export function createInvoiceFromResolvedJob(input: {
  job: Job;
  billingAction: BillingAction;
  description: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}) {
  const status = invoiceStatus(input.billingAction);
  const quantity = input.billingAction === "no-charge" ? 1 : Math.max(1, input.quantity || 1);
  const unitPrice = input.billingAction === "no-charge" ? 0 : Math.max(0, input.unitPrice || 0);
  const subtotal = quantity * unitPrice;
  const gst = subtotal * 0.1;
  const invoice: Invoice = {
    reference: invoiceReference(input.job.reference),
    customer: input.job.customer,
    relatedJob: input.job.reference,
    status: status.status,
    tone: status.tone,
    subtotal,
    gst,
    total: subtotal + gst,
    issuedAt: new Date().toLocaleDateString(),
    dueAt: input.billingAction === "invoice" ? "7 days" : "Done",
    updatedAt: "Just now",
    items: [
      {
        description: input.description || input.job.issue || input.job.device,
        quantity,
        unitPrice,
      },
    ],
    notes: input.notes,
  };

  return saveInvoiceRecord(invoice);
}

export function createManualInvoiceRecord(input: {
  customer: string;
  relatedJob: string;
  description: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}) {
  const quantity = Math.max(1, input.quantity || 1);
  const unitPrice = Math.max(0, input.unitPrice || 0);
  const subtotal = quantity * unitPrice;
  const gst = subtotal * 0.1;
  return saveInvoiceRecord({
    reference: `INV-${Date.now().toString().slice(-5)}`,
    customer: input.customer,
    relatedJob: input.relatedJob || "Not linked",
    status: "Draft",
    tone: "amber",
    subtotal,
    gst,
    total: subtotal + gst,
    issuedAt: new Date().toLocaleDateString(),
    dueAt: "7 days",
    updatedAt: "Just now",
    items: [
      { description: input.description || "Invoice line item", quantity, unitPrice },
    ],
    notes: input.notes,
  });
}
