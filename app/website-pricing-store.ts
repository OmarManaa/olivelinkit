"use client";

import { defaultWebsitePricing, mergeWebsitePricing, type WebsitePricingContent } from "./website-pricing-data";

const STORAGE_KEY = "it-services-website-pricing";

export function readWebsitePricing(): WebsitePricingContent {
  if (typeof window === "undefined") return defaultWebsitePricing;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultWebsitePricing;
  try {
    return mergeWebsitePricing(JSON.parse(raw) as Partial<WebsitePricingContent>);
  } catch {
    return defaultWebsitePricing;
  }
}

export function hasStoredWebsitePricing() {
  return typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) !== null;
}

export function saveWebsitePricing(pricing: WebsitePricingContent) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pricing));
  window.dispatchEvent(new Event("website-pricing-updated"));
}

export function resetWebsitePricing() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("website-pricing-updated"));
}
