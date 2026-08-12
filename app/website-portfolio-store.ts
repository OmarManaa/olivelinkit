"use client";

import { defaultWebsitePortfolio, type WebsitePortfolioItem } from "./website-portfolio-data";

const STORAGE_KEY = "it-services-website-portfolio";

export function readWebsitePortfolio(): WebsitePortfolioItem[] {
  if (typeof window === "undefined") return defaultWebsitePortfolio;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultWebsitePortfolio;
  try {
    const parsed = JSON.parse(raw) as WebsitePortfolioItem[];
    return Array.isArray(parsed) && parsed.length ? parsed : defaultWebsitePortfolio;
  } catch {
    return defaultWebsitePortfolio;
  }
}

export function saveWebsitePortfolio(items: WebsitePortfolioItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("website-portfolio-updated"));
}

export function resetWebsitePortfolio() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("website-portfolio-updated"));
}
