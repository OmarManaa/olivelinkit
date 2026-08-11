"use client";

import { defaultWebsiteContent, type WebsiteContent } from "./website-content-data";

const STORAGE_KEY = "it-services-website-content";

function mergeContent(input: Partial<WebsiteContent>) {
  return {
    ...defaultWebsiteContent,
    ...input,
    theme: { ...defaultWebsiteContent.theme, ...input.theme },
    trustItems: input.trustItems?.length ? input.trustItems : defaultWebsiteContent.trustItems,
    serviceHighlights: input.serviceHighlights?.length ? input.serviceHighlights : defaultWebsiteContent.serviceHighlights,
    testimonials: input.testimonials?.length ? input.testimonials : defaultWebsiteContent.testimonials,
    processSteps: input.processSteps?.length ? input.processSteps : defaultWebsiteContent.processSteps,
    skills: input.skills?.length ? input.skills : defaultWebsiteContent.skills,
    audienceItems: input.audienceItems?.length ? input.audienceItems : defaultWebsiteContent.audienceItems,
    supportPoints: input.supportPoints?.length ? input.supportPoints : defaultWebsiteContent.supportPoints,
  };
}

export function readWebsiteContent(): WebsiteContent {
  if (typeof window === "undefined") return defaultWebsiteContent;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultWebsiteContent;
  try {
    return mergeContent(JSON.parse(raw) as Partial<WebsiteContent>);
  } catch {
    return defaultWebsiteContent;
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
