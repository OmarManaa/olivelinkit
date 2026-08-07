"use client";

import type { Customer } from "./admin-data";

const STORAGE_KEY = "it-services-prospects";

export function readProspects(): Customer[] {
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

export function upsertProspect(input: {
  name: string;
  email?: string;
  phone?: string;
  status: string;
  related: string;
}) {
  if (!input.name) return null;
  const prospects = readProspects();
  const existing = prospects.find((prospect) => prospect.name.toLowerCase() === input.name.toLowerCase());
  const next: Customer = {
    id: existing?.id ?? `PROS-${Date.now().toString().slice(-5)}`,
    name: input.name,
    type: "Prospect",
    email: input.email || existing?.email || "Not captured",
    phone: input.phone || existing?.phone || "Not captured",
    devices: existing?.devices ?? "Pending intake details",
    status: input.status,
    priority: existing?.priority ?? "Normal",
    lastActivity: "Just now",
    notes: `Created from ${input.related}.`,
  };
  const merged = existing ? prospects.map((prospect) => prospect.id === existing.id ? next : prospect) : [next, ...prospects];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event("prospects-updated"));
  return next;
}
