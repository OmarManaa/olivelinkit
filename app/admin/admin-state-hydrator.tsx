"use client";

import { useEffect } from "react";
import { replacePersistedState, persistAdminState } from "../persistence-client";
import { persistedStateEntries } from "../persisted-state";
import { replaceSupportRequests } from "../support-requests-store";

function parseStoredValue(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function AdminStateHydrator() {
  useEffect(() => {
    let active = true;
    let canSynchronise = false;
    const eventHandlers = persistedStateEntries.map((entry) => ({
      ...entry,
      handler: () => {
        if (!canSynchronise) return;
        const value = parseStoredValue(window.localStorage.getItem(entry.storageKey));
        void persistAdminState(entry.key, value);
      },
    }));

    for (const entry of eventHandlers) window.addEventListener(entry.eventName, entry.handler);

    async function hydrate() {
      try {
        const [stateResponse, requestsResponse] = await Promise.all([
          fetch("/api/admin/state", { cache: "no-store" }),
          fetch("/api/admin/support-requests", { cache: "no-store" }),
        ]);
        if (!active || !stateResponse.ok) return;

        const statePayload = await stateResponse.json() as { records?: Record<string, unknown | null> };
        const records = statePayload.records ?? {};
        for (const entry of persistedStateEntries) {
          if (Object.prototype.hasOwnProperty.call(records, entry.key)) {
            replacePersistedState(entry.key, records[entry.key] ?? null);
          }
        }
        if (requestsResponse.ok) {
          const requestPayload = await requestsResponse.json() as { requests?: Parameters<typeof replaceSupportRequests>[0] };
          replaceSupportRequests(requestPayload.requests ?? []);
        }

        canSynchronise = true;
        for (const entry of persistedStateEntries) {
          if (!Object.prototype.hasOwnProperty.call(records, entry.key)) {
            const value = parseStoredValue(window.localStorage.getItem(entry.storageKey));
            if (value !== null) void persistAdminState(entry.key, value);
          }
        }
      } catch {
        // Local preview remains available without a configured D1 database.
      }
    }

    void hydrate();
    return () => {
      active = false;
      for (const entry of eventHandlers) window.removeEventListener(entry.eventName, entry.handler);
    };
  }, []);

  return null;
}
