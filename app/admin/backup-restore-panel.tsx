"use client";

import { useState } from "react";
import { persistAdminState } from "../persistence-client";
import { persistedStateEntries, type PersistedStateKey } from "../persisted-state";
import type { SupportRequest } from "../support-requests-store";

const appStateLabels: Record<PersistedStateKey, { label: string; note: string }> = {
  "site-content": { label: "Website content", note: "Branding, logo, favicon, homepage copy, CTAs, contact details, and invoice settings" },
  "site-services": { label: "Website service cards", note: "Public service card titles, icons, and request mapping" },
  "site-pricing": { label: "Service pricing", note: "Public repair prices, ranges, groups, and pricing disclaimers" },
  "site-portfolio": { label: "Website portfolio", note: "Portfolio case studies, example screenshots and gallery URLs" },
  inventory: { label: "Inventory and equipment", note: "Stock, public visibility, equipment sale cards, gallery URLs, and pricing" },
  customers: { label: "Customers", note: "Confirmed customer records created from resolved work" },
  jobs: { label: "Jobs", note: "Converted, resolved, completed, archived job records, and timestamped job history" },
  quotes: { label: "Quotes", note: "Draft, sent, and locally edited quote records" },
  invoices: { label: "Invoices", note: "Draft, sent, paid, and no-charge invoice records" },
  followups: { label: "Follow-ups", note: "Customer reminders, due dates, channels, outcomes, and snoozed tasks" },
  prospects: { label: "Prospects", note: "Visitors created from requests or quote workflows" },
};

type BackupEntry = {
  eventName: string;
  key: string;
  label: string;
  liveRestore: "app-state" | "support-requests";
  note: string;
  stateKey?: PersistedStateKey;
  storageKey: string;
};

const supportRequestEntry: BackupEntry = {
  eventName: "support-requests-updated",
  key: "support-requests",
  label: "Support requests",
  liveRestore: "support-requests",
  note: "Website questions, selected services/items, statuses, and reply workflow states",
  storageKey: "it-services-support-requests",
};

const productionSiteUrl = (process.env.NEXT_PUBLIC_PRODUCTION_SITE_URL ?? "https://olivelinkit.au").replace(/\/$/, "");

const backupEntries: BackupEntry[] = [
  supportRequestEntry,
  ...persistedStateEntries.map((entry) => ({
    eventName: entry.eventName,
    key: entry.key,
    label: appStateLabels[entry.key].label,
    liveRestore: "app-state" as const,
    note: appStateLabels[entry.key].note,
    stateKey: entry.key,
    storageKey: entry.storageKey,
  })),
];

const refreshEvents = Array.from(new Set(backupEntries.map((entry) => entry.eventName)));

type BackupFile = {
  app: string;
  data: Record<string, string | null>;
  exportedAt: string;
  source?: string;
  version: number;
};

type ValidatedBackup = {
  availableKeys: string[];
  counts: Record<string, number>;
  file: BackupFile;
};

function itemCount(raw: string | null) {
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && typeof parsed === "object") return 1;
    return raw ? 1 : 0;
  } catch {
    return raw ? 1 : 0;
  }
}

function parseBackupValue(raw: string | null) {
  if (raw === null) return null;
  return JSON.parse(raw) as unknown;
}

function supportRequestsFromRaw(raw: string | null) {
  if (raw === null) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Support requests in this backup are not a valid list.");
  return parsed as SupportRequest[];
}

function backupString(value: unknown) {
  if (value === null || typeof value === "undefined") return null;
  return JSON.stringify(value);
}

async function buildBackup(): Promise<BackupFile> {
  const data: Record<string, string | null> = {};
  for (const item of backupEntries) data[item.storageKey] = window.localStorage.getItem(item.storageKey);
  let source = "browser-admin";

  try {
    const response = await fetch("/api/admin/state", { cache: "no-store", credentials: "include" });
    if (response.ok) {
      const payload = await response.json() as { records?: Record<string, unknown | null> };
      const records = payload.records ?? {};
      for (const entry of backupEntries) {
        if (entry.liveRestore === "app-state" && entry.stateKey && Object.prototype.hasOwnProperty.call(records, entry.stateKey)) {
          data[entry.storageKey] = backupString(records[entry.stateKey]);
        }
      }
      source = "live-d1";
    }
  } catch {
    source = "browser-admin";
  }

  try {
    const response = await fetch("/api/admin/support-requests", { cache: "no-store", credentials: "include" });
    if (response.ok) {
      const payload = await response.json() as { requests?: SupportRequest[] };
      data[supportRequestEntry.storageKey] = backupString(payload.requests ?? []);
      source = source === "live-d1" ? "live-d1-and-support-requests" : "browser-admin-with-live-support-requests";
    }
  } catch {
    // Browser copy remains available when the live inbox cannot be reached.
  }

  // Include uploaded media manifest when available (metadata only; not image binaries).
  try {
    const mediaResponse = await fetch("/api/admin/media", { cache: "no-store", credentials: "include" });
    if (mediaResponse.ok) {
      const mediaPayload = await mediaResponse.json() as { items?: unknown[] };
      data["it-services-media"] = backupString(mediaPayload.items ?? []);
    }
  } catch {
    // ignore media manifest failures — backup still contains site content and support requests
  }

  return {
    app: "home-small-business-it-services",
    data,
    exportedAt: new Date().toISOString(),
    source,
    version: 2,
  };
}

async function buildRemoteBackup(): Promise<BackupFile> {
  const data: Record<string, string | null> = {};

  const stateResponse = await fetch(`${productionSiteUrl}/api/admin/state`, { cache: "no-store", credentials: "include" });
  if (!stateResponse.ok) {
    const text = await stateResponse.text().catch(() => "");
    throw new Error(`Unable to fetch live website admin state from ${productionSiteUrl}. ${stateResponse.status} ${stateResponse.statusText}${text ? `: ${text}` : ""}`);
  }

  const statePayload = await stateResponse.json() as { records?: Record<string, unknown | null> };
  const records = statePayload.records ?? {};
  for (const entry of backupEntries) {
    if (entry.liveRestore === "app-state" && entry.stateKey && Object.prototype.hasOwnProperty.call(records, entry.stateKey)) {
      data[entry.storageKey] = backupString(records[entry.stateKey]);
    }
  }

  const requestsResponse = await fetch(`${productionSiteUrl}/api/admin/support-requests`, { cache: "no-store", credentials: "include" });
  if (!requestsResponse.ok) {
    const text = await requestsResponse.text().catch(() => "");
    throw new Error(`Unable to fetch live website support requests from ${productionSiteUrl}. ${requestsResponse.status} ${requestsResponse.statusText}${text ? `: ${text}` : ""}`);
  }

  const requestsPayload = await requestsResponse.json() as { requests?: SupportRequest[] };
  data[supportRequestEntry.storageKey] = backupString(requestsPayload.requests ?? []);

  // Also fetch media manifest from production (metadata only).
  try {
    const mediaResponse = await fetch(`${productionSiteUrl}/api/admin/media`, { cache: "no-store", credentials: "include" });
    if (mediaResponse.ok) {
      const mediaPayload = await mediaResponse.json() as { items?: unknown[] };
      data["it-services-media"] = backupString(mediaPayload.items ?? []);
    }
  } catch {
    // ignore media manifest failures
  }

  // Fetch file metadata from D1 (if available)
  try {
    const filesResponse = await fetch(`${productionSiteUrl}/api/admin/files`, { cache: "no-store", credentials: "include" });
    if (filesResponse.ok) {
      const filesPayload = await filesResponse.json() as { items?: unknown[] };
      data["it-services-files"] = backupString(filesPayload.items ?? []);
    }
  } catch {
    // ignore files metadata failures
  }

  return {
    app: "home-small-business-it-services",
    data,
    exportedAt: new Date().toISOString(),
    source: "production-web",
    version: 2,
  };
}

function dispatchRefresh() {
  for (const eventName of refreshEvents) window.dispatchEvent(new Event(eventName));
}

function validateBackupText(text: string): ValidatedBackup {
  const parsed = JSON.parse(text) as BackupFile;
  if (parsed.app !== "home-small-business-it-services") throw new Error("This backup belongs to a different app.");
  if (!parsed.data || typeof parsed.data !== "object") throw new Error("Backup data is missing.");

  const counts: Record<string, number> = {};
  const availableKeys = backupEntries.filter((item) => Object.prototype.hasOwnProperty.call(parsed.data, item.storageKey)).map((item) => item.storageKey);
  for (const key of availableKeys) {
    const value = parsed.data[key];
    if (value !== null && typeof value !== "string") throw new Error("Backup data must contain JSON strings or null values only.");
    counts[key] = itemCount(value);
  }
  return { file: parsed, counts, availableKeys };
}

async function publishSupportRequests(raw: string | null) {
  const requests = supportRequestsFromRaw(raw);
  const response = await fetch("/api/admin/support-requests", {
    method: "PUT",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ requests }),
  });
  const payload = await response.json().catch(() => ({})) as { error?: string; requests?: SupportRequest[] };
  if (!response.ok) return { ok: false, error: payload.error ?? "Support requests were restored locally but not published live." };
  if (payload.requests) window.localStorage.setItem(supportRequestEntry.storageKey, JSON.stringify(payload.requests));
  return { ok: true };
}

async function publishRestoredEntry(entry: BackupEntry, raw: string | null) {
  if (entry.liveRestore === "support-requests") return publishSupportRequests(raw);
  if (!entry.stateKey) return { ok: true };
  return persistAdminState(entry.stateKey, parseBackupValue(raw));
}

export function BackupRestorePanel() {
  const [backupText, setBackupText] = useState("");
  const [validated, setValidated] = useState<ValidatedBackup | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState("Ready to export or restore.");
  const [, setPreviewVersion] = useState(0);
  const currentCounts = typeof window === "undefined" ? {} : Object.fromEntries(backupEntries.map((item) => [item.storageKey, itemCount(window.localStorage.getItem(item.storageKey))]));

  const selectedCount = selectedKeys.reduce((total, key) => total + (validated?.counts[key] ?? 0), 0);

  function refreshCounts() {
    setPreviewVersion((current) => current + 1);
  }

  async function exportBackup() {
    setIsExporting(true);
    try {
      const backupFile = await buildBackup();
      const backup = JSON.stringify(backupFile, null, 2);
      const blob = new Blob([backup], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `it-services-complete-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      setBackupText(backup);
      setMessage(`Complete admin backup exported from ${backupFile.source ?? "browser-admin"}.`);
      refreshCounts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Backup export failed.");
    } finally {
      setIsExporting(false);
    }
  }

  async function importLiveWebsiteBackup() {
    setIsImporting(true);
    try {
      const backupFile = await buildRemoteBackup();
      const backup = JSON.stringify(backupFile, null, 2);
      const validatedFile = validateBackupText(backup);
      setBackupText(backup);
      setValidated(validatedFile);
      setSelectedKeys(validatedFile.availableKeys);
      setConfirmed(false);
      setMessage(`Live website data fetched from ${productionSiteUrl}. Review and restore the selected sections locally.`);
    } catch (error) {
      setMessage(error instanceof Error
        ? `${error.message} If this keeps failing, export a production backup from the live admin and upload it here manually.`
        : "Unable to fetch live website data. Export the production backup and upload it manually if needed.");
    } finally {
      setIsImporting(false);
    }
  }

  async function chooseFile(file?: File) {
    if (!file) return;
    const text = await file.text();
    setBackupText(text);
    setValidated(null);
    setSelectedKeys([]);
    setConfirmed(false);
    setMessage(`${file.name} loaded. Validate backup before restore.`);
  }

  function validateBackup() {
    try {
      const next = validateBackupText(backupText);
      setValidated(next);
      setSelectedKeys(next.availableKeys);
      setConfirmed(false);
      setMessage(`Backup validated from ${new Date(next.file.exportedAt).toLocaleString()}.`);
    } catch (error) {
      setValidated(null);
      setSelectedKeys([]);
      setConfirmed(false);
      setMessage(error instanceof Error ? error.message : "Backup could not be validated.");
    }
  }

  function toggleKey(key: string) {
    setSelectedKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  }

  async function restoreSelected() {
    if (!validated || !confirmed || selectedKeys.length === 0) return;
    setIsRestoring(true);
    try {
      const warnings: string[] = [];
      let published = 0;
      for (const key of selectedKeys) {
        const entry = backupEntries.find((item) => item.storageKey === key);
        if (!entry) continue;
        const value = validated.file.data[key];
        if (typeof value === "string") window.localStorage.setItem(key, value);
        if (value === null) window.localStorage.removeItem(key);

        const result = await publishRestoredEntry(entry, value);
        if (result.ok) {
          published += 1;
        } else {
          warnings.push(`${entry.label}: ${result.error ?? "not published live"}`);
        }
      }
      dispatchRefresh();
      refreshCounts();
      setConfirmed(false);
      setMessage(warnings.length
        ? `Restored ${selectedKeys.length} section(s) locally and published ${published} live. ${warnings.join(" ")}`
        : `Restored ${selectedKeys.length} section(s) locally and published ${published} section(s) to the live database.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Restore failed before it could finish.");
    } finally {
      setIsRestoring(false);
    }
  }

  function clearSelection() {
    setSelectedKeys([]);
    setConfirmed(false);
  }

  return (
    <section className="backup-console">
      <div className="backup-status">{message}</div>
      <div className="backup-frame">
        <h2>Complete Admin Backup</h2>
        <div className="backup-grid">
          <article className="backup-tile backup-tile-accent">
            <h3>Export current admin data</h3>
            <p>Download a JSON recovery copy of the admin records currently loaded in this browser, including public website content, pricing, services, inventory, jobs, customers, invoices, follow-ups, prospects, quotes, and support requests.</p>
            <button className="button" disabled={isExporting} onClick={() => { void exportBackup(); }} type="button">{isExporting ? "Exporting..." : "Export complete backup"}</button>
          </article>
          <article className="backup-tile backup-tile-accent">
            <h3>Staged restore</h3>
            <p>Choose a backup, validate it, select the areas to restore, then publish the restored sections back to the live database.</p>
            <input accept="application/json" onChange={(event) => chooseFile(event.target.files?.[0])} type="file" />
            <button className="button" disabled={!backupText} onClick={validateBackup} type="button">1. Validate backup</button>
            <button className="button button-secondary" disabled={isImporting} onClick={() => { void importLiveWebsiteBackup(); }} type="button">
              {isImporting ? "Fetching live site..." : "Import from live website"}
            </button>
            <small>Requires a production admin login cookie in this browser for the live site.</small>
          </article>
          <article className="backup-tile">
            <h3>Current data summary</h3>
            <div className="backup-count-list">
              {backupEntries.map((item) => <div key={item.storageKey}><strong>{item.label}</strong><span>{currentCounts[item.storageKey] ?? 0}</span></div>)}
            </div>
          </article>
          <article className="backup-tile">
            <h3>Choose what to restore</h3>
            <div className="restore-actions">
              <button className="button button-ghost" disabled={!validated} onClick={() => setSelectedKeys(validated?.availableKeys ?? [])} type="button">Select all</button>
              <button className="button button-ghost" disabled={!validated} onClick={clearSelection} type="button">Clear selection</button>
            </div>
            <div className="restore-list">
              {backupEntries.map((item) => {
                const available = Boolean(validated?.availableKeys.includes(item.storageKey));
                return (
                  <label className={available ? "" : "disabled"} key={item.storageKey}>
                    <input checked={selectedKeys.includes(item.storageKey)} disabled={!available} onChange={() => toggleKey(item.storageKey)} type="checkbox" />
                    <span><strong>{item.label}</strong><small>{item.note}</small></span>
                    <em>{available ? `${validated?.counts[item.storageKey] ?? 0} records` : "Not in backup"}</em>
                  </label>
                );
              })}
            </div>
          </article>
          <article className="backup-tile">
            <h3>Selected restore counts</h3>
            <div className="selected-count"><strong>{selectedCount}</strong><span>records across {selectedKeys.length} selected sections</span></div>
          </article>
          <article className="backup-tile restore-confirm">
            <label>
              <input checked={confirmed} disabled={!validated || selectedKeys.length === 0 || isRestoring} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" />
              <span>I understand selected sections will replace the local browser copy and then publish to the live database.</span>
            </label>
            <button className="button" disabled={!validated || !confirmed || selectedKeys.length === 0 || isRestoring} onClick={() => { void restoreSelected(); }} type="button">{isRestoring ? "Restoring..." : "2. Restore selected data"}</button>
          </article>
          <article className="backup-note">
            <p><strong>Protected security data:</strong> admin identity, sessions, authentication, and secrets are not exported or restored.</p>
            <p><strong>Uploaded media:</strong> backup files store image URLs for logo, favicon, hero, and equipment photos. The image files themselves remain in Cloudflare R2; keep a separate R2 bucket backup/export for full disaster recovery.</p>
            <p><strong>Support requests:</strong> restored requests are merged into the live inbox by request ID so a restore does not accidentally delete newer enquiries.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
