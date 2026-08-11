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

export type PersistAdminStateResult = {
  ok: boolean;
  error?: string;
};

export async function persistAdminState(key: PersistedStateKey, value: unknown | null) {
  try {
    const response = await fetch("/api/admin/state", {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return { ok: false, error: "Your admin session needs a refresh. Open the admin page again and publish once more." };
    }
    const payload = await response.json() as { ok?: boolean; error?: string };
    if (response.ok && payload.ok) return { ok: true };
    return { ok: false, error: payload.error ?? "The live publish was not accepted." };
  } catch {
    return { ok: false, error: "The live publish could not reach the server." };
  }
}
