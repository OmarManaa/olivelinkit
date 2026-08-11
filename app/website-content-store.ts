"use client";

import { mergeWebsiteContent, type WebsiteContent } from "./website-content-data";

const STORAGE_KEY = "it-services-website-content";

export function readWebsiteContent(): WebsiteContent {
  if (typeof window === "undefined") return mergeWebsiteContent({});
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return mergeWebsiteContent({});
  try {
    return mergeWebsiteContent(JSON.parse(raw) as Partial<WebsiteContent>);
  } catch {
    return mergeWebsiteContent({});
  }
}

export function saveWebsiteContent(content: WebsiteContent) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event("website-content-updated"));
}

export function resetWebsiteContent() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("website-content-updated"));
}
