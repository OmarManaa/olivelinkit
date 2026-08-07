"use client";

import { jobs as seedJobs, type Job } from "./admin-data";
import { upsertProspect } from "./prospects-store";
import type { SupportRequest } from "../support-requests-store";

const STORAGE_KEY = "it-services-job-records";

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
  device: string;
  issue: string;
  priority?: string;
  serviceType?: string;
  owner?: string;
  dueAt?: string;
}) {
  const records = readSavedJobs();
  const reference = input.reference || `IT-${Date.now().toString().slice(-4)}`;
  const priority = input.priority || "Normal";
  const job: Job = {
    reference,
    customer: input.customer || "Website visitor",
    device: input.device || "Device pending",
    issue: input.issue || "New support job",
    status: "New",
    tone: "gray",
    priority,
    serviceType: input.serviceType || "Workshop repair",
    owner: input.owner || "Unassigned",
    dueAt: input.dueAt || "Today",
    updatedAt: "Just now",
  };
  const merged = dedupeJobs(
    records.some((record) => record.reference === reference)
      ? records.map((record) => record.reference === reference ? job : record)
      : [job, ...records],
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  upsertProspect({ name: job.customer, email: input.email, phone: input.phone, status: `Open job ${reference}`, related: reference });
  window.dispatchEvent(new Event("jobs-updated"));
  return job;
}

export function createJobFromSupportRequest(request: SupportRequest) {
  return saveJobRecord({
    reference: referenceFromRequest(request),
    customer: request.name,
    email: request.email,
    phone: request.phone,
    device: deviceFor(request.issueType),
    issue: request.details,
    priority: request.issueType === "Security" ? "High" : "Normal",
    serviceType: serviceTypeFor(request.issueType),
  });
}
