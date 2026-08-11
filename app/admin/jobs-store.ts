"use client";

import { jobs as seedJobs, type Job, type JobHistoryEntry } from "./admin-data";
import { type CustomerMergeDecision, upsertCustomerFromResolvedJob } from "./customers-store";
import { createInvoiceFromResolvedJob } from "./invoices-store";
import { upsertProspect } from "./prospects-store";
import type { SupportRequest } from "../support-requests-store";

const STORAGE_KEY = "it-services-job-records";

type JobHistoryInput = {
  author?: string;
  note: string;
  status?: string;
  type: string;
};

function timestamp() {
  return new Date().toISOString();
}

function historyId() {
  return `JH-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function historyTime(entry: JobHistoryEntry) {
  const time = new Date(entry.at).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortHistory(entries: JobHistoryEntry[]) {
  return [...entries].sort((a, b) => historyTime(b) - historyTime(a));
}

function createHistoryEntry(input: JobHistoryInput): JobHistoryEntry {
  return {
    id: historyId(),
    at: timestamp(),
    type: input.type,
    note: input.note.trim(),
    author: input.author?.trim() || "Omar",
    status: input.status,
  };
}

export function historyForJob(job: Job): JobHistoryEntry[] {
  if (Array.isArray(job.history) && job.history.length > 0) return sortHistory(job.history);
  if (!job.issue?.trim()) return [];
  return [{
    id: `${job.reference}-initial-note`,
    at: job.updatedAt || "",
    type: "Initial issue",
    note: job.issue,
    author: job.owner,
    status: job.status,
  }];
}

export function latestJobHistory(job: Job) {
  return historyForJob(job)[0];
}

function dedupeJobs(records: Job[]) {
  const byReference = new Map<string, Job>();
  for (const record of records) {
    if (!byReference.has(record.reference)) byReference.set(record.reference, record);
  }
  return Array.from(byReference.values());
}

function referenceFromRequest(request: SupportRequest) {
  const digits = request.id.replace(/\D/g, "");
  return `IT-${(digits || Date.now().toString()).slice(-4).padStart(4, "0")}`;
}

export function serviceTypeFor(issueType: string) {
  if (issueType === "Network or Wi-Fi" || issueType === "Business IT") return "Business onsite";
  if (issueType === "Equipment enquiry") return "Equipment setup";
  if (issueType === "Remote support" || issueType === "Microsoft 365 or email") return "Remote support";
  return "Workshop repair";
}

function deviceFor(issueType: string) {
  if (issueType === "Network or Wi-Fi") return "Network / NBN";
  if (issueType === "Microsoft 365 or email") return "Microsoft 365";
  if (issueType === "Remote support") return "Remote support";
  if (issueType === "Equipment enquiry") return "Equipment enquiry";
  return "Device pending";
}

function toneForStatus(status: string): Job["tone"] {
  if (status === "Completed" || status === "Ready") return "green";
  if (status === "In progress") return "blue";
  if (status === "Waiting parts" || status === "Quote sent") return "amber";
  return "gray";
}

function selectedContextFor(request: SupportRequest) {
  if (request.selectedItem) {
    return [
      request.selectedItem.name,
      request.selectedItem.sku ? `SKU ${request.selectedItem.sku}` : "",
      request.selectedItem.category,
      request.selectedItem.condition,
      typeof request.selectedItem.salePrice === "number" ? `$${request.selectedItem.salePrice}` : "",
    ].filter(Boolean).join(" - ");
  }
  return request.selectedService ?? "";
}

export function readSavedJobs(): Job[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Job[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readJobs(baseJobs: Job[] = seedJobs) {
  return dedupeJobs([...readSavedJobs(), ...baseJobs]);
}

export function saveJobRecord(input: {
  reference?: string;
  customer: string;
  email?: string;
  phone?: string;
  customerId?: string;
  device: string;
  issue: string;
  status?: string;
  tone?: Job["tone"];
  priority?: string;
  serviceType?: string;
  owner?: string;
  dueAt?: string;
  updatedAt?: string;
  completedAt?: string;
  archivedAt?: string;
  resolutionSummary?: string;
  billingStatus?: Job["billingStatus"];
  invoiceReference?: string;
  history?: JobHistoryEntry[];
  historyEntry?: JobHistoryInput;
  syncProspect?: boolean;
}) {
  const records = readSavedJobs();
  const reference = input.reference || `IT-${Date.now().toString().slice(-4)}`;
  const existing = records.find((record) => record.reference === reference) || seedJobs.find((record) => record.reference === reference);
  const priority = input.priority || existing?.priority || "Normal";
  const status = input.status || existing?.status || "New";
  const history = input.history ? sortHistory(input.history) : existing ? historyForJob(existing) : [];
  const newHistoryEntries: JobHistoryEntry[] = [];

  if (!existing && input.issue?.trim()) {
    newHistoryEntries.push(createHistoryEntry({
      type: "Job created",
      note: input.issue,
      author: input.owner,
      status,
    }));
  }

  if (existing && existing.status !== status) {
    newHistoryEntries.push(createHistoryEntry({
      type: "Status change",
      note: `Status changed from ${existing.status} to ${status}.`,
      author: input.owner || existing.owner,
      status,
    }));
  }

  if (input.historyEntry?.note.trim()) {
    newHistoryEntries.push(createHistoryEntry({
      ...input.historyEntry,
      status: input.historyEntry.status || status,
    }));
  }

  const job: Job = {
    reference,
    customer: input.customer || existing?.customer || "Website visitor",
    email: input.email ?? existing?.email,
    phone: input.phone ?? existing?.phone,
    customerId: input.customerId ?? existing?.customerId,
    device: input.device || existing?.device || "Device pending",
    issue: input.issue || existing?.issue || "New support job",
    status,
    tone: input.tone || (input.status ? toneForStatus(status) : existing?.tone) || toneForStatus(status),
    priority,
    serviceType: input.serviceType || existing?.serviceType || "Workshop repair",
    owner: input.owner || existing?.owner || "Unassigned",
    dueAt: input.dueAt || existing?.dueAt || "Today",
    updatedAt: input.updatedAt || "Just now",
    completedAt: input.completedAt ?? existing?.completedAt,
    archivedAt: input.archivedAt ?? existing?.archivedAt,
    resolutionSummary: input.resolutionSummary ?? existing?.resolutionSummary,
    billingStatus: input.billingStatus ?? existing?.billingStatus,
    invoiceReference: input.invoiceReference ?? existing?.invoiceReference,
    history: sortHistory([...newHistoryEntries, ...history]),
  };
  const merged = dedupeJobs(
    records.some((record) => record.reference === reference)
      ? records.map((record) => record.reference === reference ? job : record)
      : [job, ...records],
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  if (input.syncProspect !== false) {
    upsertProspect({ name: job.customer, email: input.email, phone: input.phone, status: `Open job ${reference}`, related: reference });
  }
  window.dispatchEvent(new Event("jobs-updated"));
  return job;
}

export function createJobFromSupportRequest(request: SupportRequest) {
  const selectedContext = selectedContextFor(request);
  return saveJobRecord({
    reference: referenceFromRequest(request),
    customer: request.name,
    email: request.email,
    phone: request.phone,
    device: request.selectedItem?.name || request.selectedService || deviceFor(request.issueType),
    issue: [selectedContext ? `Clicked item/service: ${selectedContext}` : "", request.details].filter(Boolean).join("\n\n"),
    priority: request.issueType === "Security" ? "High" : "Normal",
    serviceType: serviceTypeFor(request.issueType),
  });
}

export function resolveJobRecord(input: {
  job: Job;
  resolutionSummary: string;
  billingAction: "invoice" | "already-paid" | "no-charge";
  lineDescription: string;
  quantity: number;
  unitPrice: number;
  archiveAfter: boolean;
  customerDecision: CustomerMergeDecision;
}) {
  const invoice = createInvoiceFromResolvedJob({
    job: input.job,
    billingAction: input.billingAction,
    description: input.lineDescription,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    notes: input.resolutionSummary,
  });
  const customer = upsertCustomerFromResolvedJob({
    job: input.job,
    resolutionSummary: input.resolutionSummary,
    decision: input.customerDecision,
  });
  const completedAt = new Date().toLocaleString();
  const billingStatus: Job["billingStatus"] = input.billingAction === "no-charge"
    ? "No charge"
    : input.billingAction === "already-paid"
      ? "Already paid"
      : "Draft invoice";

  const job = saveJobRecord({
    ...input.job,
    customerId: customer.id,
    status: "Completed",
    tone: "green",
    dueAt: input.archiveAfter ? "Archived" : "Done",
    updatedAt: "Just now",
    completedAt,
    archivedAt: input.archiveAfter ? completedAt : undefined,
    resolutionSummary: input.resolutionSummary,
    billingStatus,
    invoiceReference: invoice.reference,
    history: input.job.history,
    historyEntry: {
      type: "Resolution",
      note: input.resolutionSummary || "Job completed.",
      author: input.job.owner,
      status: "Completed",
    },
    syncProspect: false,
  });

  return { job, invoice, customer };
}
