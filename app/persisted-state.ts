export const persistedStateEntries = [
  { key: "site-content", storageKey: "it-services-website-content", eventName: "website-content-updated" },
  { key: "site-services", storageKey: "it-services-website-services", eventName: "website-services-updated" },
  { key: "site-pricing", storageKey: "it-services-website-pricing", eventName: "website-pricing-updated" },
  { key: "site-portfolio", storageKey: "it-services-website-portfolio", eventName: "website-portfolio-updated" },
  { key: "inventory", storageKey: "it-services-inventory-items", eventName: "inventory-items-updated" },
  { key: "customers", storageKey: "it-services-customers", eventName: "customers-updated" },
  { key: "jobs", storageKey: "it-services-job-records", eventName: "jobs-updated" },
  { key: "quotes", storageKey: "it-services-quote-drafts", eventName: "quote-drafts-updated" },
  { key: "invoices", storageKey: "it-services-invoices", eventName: "invoices-updated" },
  { key: "followups", storageKey: "it-services-followups", eventName: "followups-updated" },
  { key: "prospects", storageKey: "it-services-prospects", eventName: "prospects-updated" },
] as const;

export type PersistedStateKey = (typeof persistedStateEntries)[number]["key"];

export function isPersistedStateKey(value: string): value is PersistedStateKey {
  return persistedStateEntries.some((entry) => entry.key === value);
}
