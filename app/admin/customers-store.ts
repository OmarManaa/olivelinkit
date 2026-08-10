"use client";

import { customers as seedCustomers, type Customer, type Job } from "./admin-data";
import { readProspects } from "./prospects-store";

const STORAGE_KEY = "it-services-customers";

export type CustomerMergeDecision = {
  mode: "auto-email" | "merge-existing" | "create-new";
  targetCustomerId?: string;
};

export type CustomerMatches = {
  emailMatch?: Customer;
  phoneMatches: Customer[];
  nameMatches: Customer[];
};

function usable(value?: string) {
  if (!value) return "";
  const trimmed = value.trim();
  return trimmed === "Not captured" ? "" : trimmed;
}

function normaliseEmail(value?: string) {
  return usable(value).toLowerCase();
}

function normalisePhone(value?: string) {
  const digits = usable(value).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("61")) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function normaliseName(value?: string) {
  return usable(value).toLowerCase().replace(/\s+/g, " ");
}

function hasContact(customer: Customer) {
  return Boolean(normaliseEmail(customer.email) || normalisePhone(customer.phone));
}

function isSameCustomer(left: Customer, right: Customer) {
  const leftEmail = normaliseEmail(left.email);
  const rightEmail = normaliseEmail(right.email);
  const leftPhone = normalisePhone(left.phone);
  const rightPhone = normalisePhone(right.phone);
  if (leftEmail && rightEmail && leftEmail === rightEmail) return true;
  if (leftPhone && rightPhone && leftPhone === rightPhone) return true;
  return normaliseName(left.name) === normaliseName(right.name) && (!hasContact(left) || !hasContact(right));
}

function highestPriority(left: Customer["priority"], right: Customer["priority"]) {
  const score = { Low: 1, Normal: 2, High: 3 } as const;
  return score[left] >= score[right] ? left : right;
}

function usableDetails(value: string, emptyValue: string) {
  return usable(value) || emptyValue;
}

function mergeCustomer(left: Customer, right: Customer): Customer {
  const primary = left.type !== "Prospect" || right.type === "Prospect" ? left : right;
  const secondary = primary === left ? right : left;
  const primaryDevices = usableDetails(primary.devices, "No devices recorded");
  const secondaryDevices = usableDetails(secondary.devices, "No devices recorded");
  const devices = primaryDevices === "Pending intake details" || primaryDevices === "No devices recorded"
    ? secondaryDevices
    : primaryDevices;

  return {
    ...primary,
    email: usableDetails(primary.email, usableDetails(secondary.email, "Not captured")),
    phone: usableDetails(primary.phone, usableDetails(secondary.phone, "Not captured")),
    devices,
    priority: highestPriority(primary.priority, secondary.priority),
    notes: [primary.notes, secondary.notes].filter(Boolean).filter((value, index, values) => values.indexOf(value) === index).join("\n"),
  };
}

function uniqueCustomers(records: Customer[]) {
  const result: Customer[] = [];
  for (const record of records) {
    const existingIndex = result.findIndex((existing) => isSameCustomer(existing, record));
    if (existingIndex < 0) {
      result.push(record);
      continue;
    }
    result[existingIndex] = mergeCustomer(result[existingIndex], record);
  }
  return result;
}

export function dedupeCustomerRecords(records: Customer[]) {
  return uniqueCustomers(records);
}

function customerTypeFor(job: Job, existing?: Customer): Customer["type"] {
  if (existing && existing.type !== "Prospect") return existing.type;
  return job.serviceType.toLowerCase().includes("business") ? "Business" : "Home";
}

function appendUnique(existing: string, value: string) {
  const cleanExisting = usable(existing);
  const cleanValue = usable(value);
  if (!cleanValue) return cleanExisting || "Not captured";
  if (!cleanExisting || cleanExisting === "Not captured") return cleanValue;
  return cleanExisting.toLowerCase().includes(cleanValue.toLowerCase()) ? cleanExisting : `${cleanExisting}, ${cleanValue}`;
}

export function readSavedCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readCustomerRecords(baseCustomers: Customer[] = seedCustomers) {
  return uniqueCustomers([...readSavedCustomers(), ...baseCustomers]);
}

export function readCustomerAndProspectRecords(baseCustomers: Customer[] = seedCustomers) {
  return uniqueCustomers([...readSavedCustomers(), ...readProspects(), ...baseCustomers]);
}

export function findCustomerMatches(input: { name?: string; email?: string; phone?: string }, baseCustomers: Customer[] = seedCustomers): CustomerMatches {
  const records = readCustomerAndProspectRecords(baseCustomers);
  const email = normaliseEmail(input.email);
  const phone = normalisePhone(input.phone);
  const name = normaliseName(input.name);
  const emailMatch = email ? records.find((customer) => normaliseEmail(customer.email) === email) : undefined;
  const phoneMatches = phone
    ? records.filter((customer) => customer.id !== emailMatch?.id && normalisePhone(customer.phone) === phone)
    : [];
  const nameMatches = name
    ? records.filter((customer) => customer.id !== emailMatch?.id && !phoneMatches.some((match) => match.id === customer.id) && normaliseName(customer.name) === name)
    : [];

  return { emailMatch, phoneMatches, nameMatches };
}

export function saveCustomerRecord(customer: Customer) {
  const saved = readSavedCustomers();
  const merged = saved.some((record) => record.id === customer.id)
    ? saved.map((record) => record.id === customer.id ? customer : record)
    : [customer, ...saved];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event("customers-updated"));
  return customer;
}

export function upsertCustomerFromResolvedJob(input: {
  job: Job;
  resolutionSummary: string;
  decision: CustomerMergeDecision;
  baseCustomers?: Customer[];
}) {
  const baseCustomers = input.baseCustomers ?? seedCustomers;
  const allRecords = readCustomerAndProspectRecords(baseCustomers);
  const matches = findCustomerMatches(input.job, baseCustomers);
  const target = input.decision.mode === "create-new"
    ? undefined
    : allRecords.find((customer) => customer.id === input.decision.targetCustomerId) || matches.emailMatch;
  const now = "Just now";
  const additionalEmail = target && normaliseEmail(target.email) && normaliseEmail(input.job.email) && normaliseEmail(target.email) !== normaliseEmail(input.job.email)
    ? `Additional email confirmed on ${input.job.reference}: ${input.job.email}`
    : "";
  const additionalPhone = target && normalisePhone(target.phone) && normalisePhone(input.job.phone) && normalisePhone(target.phone) !== normalisePhone(input.job.phone)
    ? `Additional phone confirmed on ${input.job.reference}: ${input.job.phone}`
    : "";
  const noteLines = [
    target?.notes,
    `Resolved ${input.job.reference}: ${input.resolutionSummary || input.job.issue}`,
    additionalEmail,
    additionalPhone,
  ].filter(Boolean);

  const customer: Customer = {
    id: target?.id ?? `CUST-${Date.now().toString().slice(-6)}`,
    name: input.job.customer || target?.name || "Website customer",
    type: customerTypeFor(input.job, target),
    email: target?.email && target.email !== "Not captured" ? target.email : input.job.email || "Not captured",
    phone: target?.phone && target.phone !== "Not captured" ? target.phone : input.job.phone || "Not captured",
    devices: appendUnique(target?.devices ?? "", input.job.device),
    status: `Completed job ${input.job.reference}`,
    priority: target?.priority ?? (input.job.priority === "High" ? "High" : "Normal"),
    lastActivity: now,
    notes: noteLines.join("\n"),
  };

  return saveCustomerRecord(customer);
}
