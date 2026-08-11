import { persistedStateEntries, type PersistedStateKey } from "./persisted-state";

export function replacePersistedState(key: PersistedStateKey, value: unknown | null) {
  if (typeof window === "undefined") return;
  const entry = persistedStateEntries.find((candidate) => candidate.key === key);
  if (!entry) return;

  if (value === null) {
    window.localStorage.removeItem(entry.storageKey);
  } else {
    window.localStorage.setItem(entry.storageKey, JSON.stringify(value));
  }
  window.dispatchEvent(new Event(entry.eventName));
}

export async function persistAdminState(key: PersistedStateKey, value: unknown | null) {
  const response = await fetch("/api/admin/state", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  return response.ok;
}
