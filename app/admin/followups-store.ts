"use client";

import { followups as seedFollowups, type Followup } from "./admin-data";
import type { SupportRequest } from "../support-requests-store";

const STORAGE_KEY = "it-services-followups";

function toneFor(status: Followup["status"]): Followup["tone"] {
  if (status === "Completed") return "green";
  if (status === "Due" || status === "Overdue") return "amber";
  if (status === "Scheduled") return "blue";
  return "gray";
}

function dedupeFollowups(records: Followup[]) {
  const byId = new Map<string, Followup>();
  for (const record of records) byId.set(record.id, record);
  return Array.from(byId.values());
}

export function readSavedFollowups(): Followup[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Followup[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readFollowups(baseFollowups: Followup[] = seedFollowups) {
  return dedupeFollowups([...baseFollowups, ...readSavedFollowups()]);
}

export function saveFollowups(records: Followup[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupeFollowups(records)));
  window.dispatchEvent(new Event("followups-updated"));
}

export function saveFollowupRecord(input: Partial<Followup> & Pick<Followup, "customer" | "reason" | "related">) {
  const records = readSavedFollowups();
  const status = input.status || "Scheduled";
  const record: Followup = {
    id: input.id || `FU-${Date.now().toString().slice(-5)}`,
    customer: input.customer || "Customer pending",
    reason: input.reason || "Follow up with customer",
    related: input.related || "Not linked",
    dueAt: input.dueAt || "Tomorrow",
    dueDateTime: input.dueDateTime,
    owner: input.owner || "Omar",
    status,
    tone: input.tone || toneFor(status),
    channel: input.channel || "Email",
    priority: input.priority || "Normal",
    outcome: input.outcome,
    lastAction: input.lastAction,
    completedAt: input.completedAt,
  };
  const merged = records.some((item) => item.id === record.id)
    ? records.map((item) => item.id === record.id ? record : item)
    : [record, ...records];
  saveFollowups(merged);
  return record;
}

export function updateFollowupRecord(id: string, changes: Partial<Followup>) {
  const records = readFollowups();
  const updatedRecords = records.map((record) => {
    if (record.id !== id) return record;
    const status = changes.status || record.status;
    return {
      ...record,
      ...changes,
      status,
      tone: changes.tone || toneFor(status),
      lastAction: changes.lastAction || new Date().toLocaleString(),
    };
  });
  const updated = updatedRecords.find((record) => record.id === id);
  if (!updated) return undefined;
  const saved = readSavedFollowups();
  const savedRecords = saved.some((record) => record.id === id)
    ? saved.map((record) => record.id === id ? updated : record)
    : [updated, ...saved];
  saveFollowups(savedRecords);
  return updated;
}

export function completeFollowup(id: string, outcome: string) {
  return updateFollowupRecord(id, {
    status: "Completed",
    dueAt: "Done",
    outcome: outcome || "Follow-up completed.",
    completedAt: new Date().toLocaleString(),
  });
}

export function snoozeFollowup(id: string, dueAt: string, outcome?: string, dueDateTime?: string) {
  return updateFollowupRecord(id, {
    status: "Scheduled",
    dueAt,
    dueDateTime,
    outcome: outcome || "Follow-up rescheduled.",
  });
}

export function markFollowupWaiting(id: string, outcome?: string) {
  return updateFollowupRecord(id, {
    status: "Waiting",
    dueAt: "Waiting",
    outcome: outcome || "Waiting for customer reply.",
  });
}

export function scheduleFollowupFromSupportRequest(request: SupportRequest) {
  const reason = `Follow up on ${request.issueType.toLowerCase()} request`;
  const channel: Followup["channel"] = request.phone ? "WhatsApp" : "Email";
  const existing = readFollowups().find((item) => item.related === request.id && item.status !== "Completed");

  if (existing) {
    return updateFollowupRecord(existing.id, {
      customer: request.name,
      reason,
      channel,
      dueAt: existing.dueAt === "Waiting" ? "Tomorrow" : existing.dueAt,
      status: existing.status === "Waiting" ? "Scheduled" : existing.status,
      outcome: request.details || existing.outcome,
    });
  }

  return saveFollowupRecord({
    customer: request.name,
    reason,
    related: request.id,
    dueAt: "Tomorrow",
    owner: "Omar",
    channel,
    status: "Scheduled",
    outcome: request.details || undefined,
  });
}
