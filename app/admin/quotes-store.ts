"use client";

import type { Quote } from "./admin-data";
import { upsertProspect } from "./prospects-store";

const STORAGE_KEY = "it-services-quote-drafts";

function quoteKey(quote: Pick<Quote, "customer" | "relatedJob" | "title">) {
  return [quote.customer, quote.relatedJob, quote.title]
    .map((value) => value.trim().toLowerCase().replace(/\s+/g, " "))
    .join("|");
}

function qualityScore(quote: Quote) {
  let score = quote.total || 0;
  if (quote.expiresAt && quote.expiresAt !== "Not sent") score += 100000;
  if (quote.items.some((item) => item.unitPrice > 0)) score += 10000;
  return score;
}

function dedupeDrafts(drafts: Quote[]) {
  const byKey = new Map<string, Quote>();
  for (const draft of drafts) {
    const key = quoteKey(draft);
    const existing = byKey.get(key);
    if (!existing || qualityScore(draft) > qualityScore(existing)) {
      byKey.set(key, draft);
    }
  }
  return Array.from(byKey.values());
}

export function readQuoteDrafts(): Quote[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Quote[];
    if (!Array.isArray(parsed)) return [];
    const drafts = dedupeDrafts(parsed);
    if (drafts.length !== parsed.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    }
    return drafts;
  } catch {
    return [];
  }
}

export function saveQuoteDraft(input: {
  reference?: string;
  customer: string;
  email?: string;
  phone?: string;
  relatedJob: string;
  title: string;
  notes: string;
  expiresAt: string;
  quantity?: number;
  unitPrice?: number;
  status?: Quote["status"];
  tone?: Quote["tone"];
}) {
  const drafts = readQuoteDrafts();
  const relatedJob = input.relatedJob || "Not linked";
  const title = input.title || "Draft quote";
  const matchingDraft = drafts.find((draft) => quoteKey(draft) === quoteKey({ customer: input.customer, relatedJob, title }));
  const reference = input.reference || matchingDraft?.reference || `Q-${Date.now().toString().slice(-4)}`;
  const quantity = input.quantity || 1;
  const unitPrice = input.unitPrice || 0;
  const subtotal = quantity * unitPrice;
  const gst = subtotal * 0.1;
  const draft: Quote = {
    reference,
    customer: input.customer,
    relatedJob,
    title,
    status: input.status || "Draft",
    tone: input.tone || "gray",
    subtotal,
    gst,
    total: subtotal + gst,
    expiresAt: input.expiresAt || "Not sent",
    updatedAt: "Just now",
    items: [
      { description: input.title || input.notes || "Quote line item pending", quantity, unitPrice },
    ],
  };
  const merged = dedupeDrafts(
    drafts.some((item) => item.reference === reference)
      ? drafts.map((item) => item.reference === reference ? draft : item)
      : [draft, ...drafts],
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  upsertProspect({ name: input.customer, email: input.email, phone: input.phone, status: `Draft quote ${reference}`, related: reference });
  window.dispatchEvent(new Event("quote-drafts-updated"));
  return draft;
}

export function readQuoteDraft(reference: string) {
  return readQuoteDrafts().find((quote) => quote.reference === reference);
}

export function saveQuoteRecord(quote: Quote) {
  const drafts = readQuoteDrafts();
  const merged = dedupeDrafts(
    drafts.some((item) => item.reference === quote.reference)
      ? drafts.map((item) => item.reference === quote.reference ? quote : item)
      : [quote, ...drafts],
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  upsertProspect({ name: quote.customer, status: `${quote.status} quote ${quote.reference}`, related: quote.reference });
  window.dispatchEvent(new Event("quote-drafts-updated"));
  return quote;
}

export function markQuoteSent(quote: Quote) {
  return saveQuoteRecord({
    ...quote,
    status: "Sent",
    tone: "amber",
    updatedAt: "Just now",
  });
}
