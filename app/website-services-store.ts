"use client";

import { defaultWebsiteServices, type WebsiteService } from "./website-services-data";

const STORAGE_KEY = "it-services-website-services";

export function readWebsiteServices(): WebsiteService[] {
  if (typeof window === "undefined") return defaultWebsiteServices;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultWebsiteServices;
  try {
    const parsed = JSON.parse(raw) as WebsiteService[];
    return Array.isArray(parsed) && parsed.length ? parsed : defaultWebsiteServices;
  } catch {
    return defaultWebsiteServices;
  }
}

export function hasStoredWebsiteServices() {
  return typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) !== null;
}

export function saveWebsiteServices(services: WebsiteService[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  window.dispatchEvent(new Event("website-services-updated"));
}

export function resetWebsiteServices() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("website-services-updated"));
}
