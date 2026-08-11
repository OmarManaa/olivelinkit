"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

type MediaItem = {
  key: string;
  url: string;
  name: string;
  folder: string;
  size: number;
  uploadedAt: string;
  used: boolean;
  usageStatus: "used" | "unused" | "unknown";
  canDelete: boolean;
};

type MediaLibraryResponse = {
  items?: MediaItem[];
  usageKnown?: boolean;
  error?: string;
};

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 102.4) / 10} KB`;
  return `${Math.round(value / 1024 / 102.4) / 10} MB`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export function MediaLibraryPanel() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [usageKnown, setUsageKnown] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState("");
  const [message, setMessage] = useState("");

  async function loadMedia() {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const payload = await response.json() as MediaLibraryResponse;
      if (!response.ok) throw new Error(payload.error || "Image library could not be loaded.");
      setItems(payload.items ?? []);
      setUsageKnown(payload.usageKnown !== false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image library could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  async function removeImage(item: MediaItem) {
    if (!item.canDelete) return;
    if (!window.confirm(`Remove "${item.name}" from uploaded images?`)) return;

    setDeletingKey(item.key);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/media?key=${encodeURIComponent(item.key)}`, { method: "DELETE" });
      const payload = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Image could not be removed.");
      setItems((current) => current.filter((candidate) => candidate.key !== item.key));
      setMessage("Unused image removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image could not be removed.");
    } finally {
      setDeletingKey("");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadMedia(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <article className="content-editor-card media-library-panel">
      <header>
        <div><span>Uploaded images</span><h2>Media library</h2></div>
        <button className="table-link table-button" disabled={isLoading} onClick={() => { void loadMedia(); }} type="button">
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <div className="media-library-note full">
        <strong>{usageKnown ? "Unused images can be removed here." : "Usage checking is temporarily unavailable."}</strong>
        <small>{usageKnown ? "Images marked in use are referenced by website content, inventory, equipment, or support requests." : "Deletion is paused until the database can be checked, so live images are not removed by mistake."}</small>
      </div>

      {message && <div className="assistant-saved full">{message}</div>}
      {isLoading && <div className="empty-note full">Loading uploaded images...</div>}
      {!isLoading && items.length === 0 && <div className="empty-note full">No uploaded images found yet.</div>}

      {!isLoading && items.length > 0 && (
        <div className="media-library-grid full">
          {items.map((item) => (
            <section className="media-library-item" key={item.key}>
              <img src={item.url} alt="" loading="lazy" decoding="async" />
              <div className="media-library-item-body">
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.folder} / {formatBytes(item.size)} / {formatDate(item.uploadedAt)}</small>
                </div>
                <code>{item.key}</code>
                <div className="media-library-actions">
                  <span className={`media-library-pill ${item.usageStatus}`.trim()}>{item.usageStatus === "used" ? "In use" : item.usageStatus === "unknown" ? "Unknown" : "Unused"}</span>
                  <button className="table-link table-button" disabled={!item.canDelete || deletingKey === item.key} onClick={() => { void removeImage(item); }} type="button">
                    {deletingKey === item.key ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
