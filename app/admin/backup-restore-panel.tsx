"use client";

import { useMemo, useState } from "react";

const backupKeys = [
  { key: "it-services-support-requests", label: "Support requests", note: "Website questions and reply workflow states" },
  { key: "it-services-quote-drafts", label: "Quotes", note: "Draft, sent, and locally edited quote records" },
  { key: "it-services-prospects", label: "Prospects", note: "Visitors created from requests or quote workflows" },
  { key: "it-services-website-services", label: "Website service cards", note: "Public service card titles, icons, and request mapping" },
  { key: "it-services-website-content", label: "Website content", note: "Homepage copy, CTAs, contact details, and trust text" },
  { key: "it-services-inventory-items", label: "Inventory and equipment", note: "Stock, public visibility, equipment sale cards, and pricing" },
];

const refreshEvents = ["support-requests-updated", "quote-drafts-updated", "prospects-updated", "website-services-updated", "website-content-updated", "inventory-items-updated"];

type BackupFile = {
  app: string;
  version: number;
  exportedAt: string;
  data: Record<string, string | null>;
};

type ValidatedBackup = {
  file: BackupFile;
  counts: Record<string, number>;
  availableKeys: string[];
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

function buildBackup(): BackupFile {
  const data: Record<string, string | null> = {};
  for (const item of backupKeys) data[item.key] = window.localStorage.getItem(item.key);
  return { app: "home-small-business-it-services", version: 1, exportedAt: new Date().toISOString(), data };
}

function dispatchRefresh() {
  for (const eventName of refreshEvents) window.dispatchEvent(new Event(eventName));
}

function validateBackupText(text: string): ValidatedBackup {
  const parsed = JSON.parse(text) as BackupFile;
  if (parsed.app !== "home-small-business-it-services") throw new Error("This backup belongs to a different app.");
  if (!parsed.data || typeof parsed.data !== "object") throw new Error("Backup data is missing.");
  const counts: Record<string, number> = {};
  const availableKeys = backupKeys.filter((item) => Object.prototype.hasOwnProperty.call(parsed.data, item.key)).map((item) => item.key);
  for (const key of availableKeys) counts[key] = itemCount(parsed.data[key]);
  return { file: parsed, counts, availableKeys };
}

export function BackupRestorePanel() {
  const [backupText, setBackupText] = useState("");
  const [validated, setValidated] = useState<ValidatedBackup | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("Ready to edit.");
  const [previewVersion, setPreviewVersion] = useState(0);

  const currentCounts = useMemo(() => {
    previewVersion;
    if (typeof window === "undefined") return {};
    return Object.fromEntries(backupKeys.map((item) => [item.key, itemCount(window.localStorage.getItem(item.key))]));
  }, [previewVersion]);

  const selectedCount = selectedKeys.reduce((total, key) => total + (validated?.counts[key] ?? 0), 0);

  function refreshCounts() {
    setPreviewVersion((current) => current + 1);
  }

  function exportBackup() {
    const backup = JSON.stringify(buildBackup(), null, 2);
    const blob = new Blob([backup], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `it-services-complete-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setBackupText(backup);
    setMessage("Complete backup exported.");
    refreshCounts();
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

  function restoreSelected() {
    if (!validated || !confirmed || selectedKeys.length === 0) return;
    for (const key of selectedKeys) {
      const value = validated.file.data[key];
      if (typeof value === "string") window.localStorage.setItem(key, value);
      if (value === null) window.localStorage.removeItem(key);
    }
    dispatchRefresh();
    refreshCounts();
    setMessage(`${selectedKeys.length} section${selectedKeys.length === 1 ? "" : "s"} restored from backup.`);
    setConfirmed(false);
  }

  function clearSelection() {
    setSelectedKeys([]);
    setConfirmed(false);
  }

  return (
    <section className="backup-console">
      <div className="backup-status">{message}</div>
      <div className="backup-frame">
        <h2>Complete Backup & Restore</h2>
        <div className="backup-grid">
          <article className="backup-tile backup-tile-accent">
            <h3>Export all business data</h3>
            <p>Download a complete JSON snapshot of editable local admin data, including website content, quotes, requests, prospects, and public equipment records.</p>
            <button className="button" onClick={exportBackup} type="button">Export complete backup</button>
          </article>
          <article className="backup-tile backup-tile-accent">
            <h3>Staged restore wizard</h3>
            <p>Choose a backup, validate it, select the areas to restore, then restore only those local records.</p>
            <input accept="application/json" onChange={(event) => chooseFile(event.target.files?.[0])} type="file" />
            <button className="button" disabled={!backupText} onClick={validateBackup} type="button">1. Validate backup</button>
          </article>
          <article className="backup-tile">
            <h3>Current data summary</h3>
            <div className="backup-count-list">
              {backupKeys.map((item) => <div key={item.key}><strong>{item.label}</strong><span>{currentCounts[item.key] ?? 0}</span></div>)}
            </div>
          </article>
          <article className="backup-tile">
            <h3>Choose what to restore</h3>
            <div className="restore-actions">
              <button className="button button-ghost" disabled={!validated} onClick={() => setSelectedKeys(validated?.availableKeys ?? [])} type="button">Select all</button>
              <button className="button button-ghost" disabled={!validated} onClick={clearSelection} type="button">Clear selection</button>
            </div>
            <div className="restore-list">
              {backupKeys.map((item) => {
                const available = Boolean(validated?.availableKeys.includes(item.key));
                return (
                  <label className={available ? "" : "disabled"} key={item.key}>
                    <input checked={selectedKeys.includes(item.key)} disabled={!available} onChange={() => toggleKey(item.key)} type="checkbox" />
                    <span><strong>{item.label}</strong><small>{item.note}</small></span>
                    <em>{available ? `${validated?.counts[item.key] ?? 0} records` : "Not in backup"}</em>
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
              <input checked={confirmed} disabled={!validated || selectedKeys.length === 0} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" />
              <span>I understand selected local records will be replaced by the backup snapshot.</span>
            </label>
            <button className="button" disabled={!validated || !confirmed || selectedKeys.length === 0} onClick={restoreSelected} type="button">2. Restore selected data</button>
          </article>
          <article className="backup-note">
            <p><strong>Protected security data:</strong> admin identity, sessions, and authentication are not exported or restored.</p>
            <p><strong>Local mode:</strong> this backup protects browser localStorage data. Once the site uses a real database, this wizard should export database tables instead.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
