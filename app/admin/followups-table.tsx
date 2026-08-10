"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supportEmailHref, whatsappHref } from "../contact-config";
import { customers as baseCustomers, type Customer, type Followup } from "./admin-data";
import { readCustomerAndProspectRecords } from "./customers-store";
import { completeFollowup, markFollowupWaiting, readFollowups, snoozeFollowup, updateFollowupRecord } from "./followups-store";

type FollowupsTableProps = {
  followups: Followup[];
};

function contactFor(item: Followup, customers: Customer[]) {
  return customers.find((customer) => customer.name.toLowerCase() === item.customer.toLowerCase());
}

function phoneHref(phone?: string) {
  if (!phone || phone === "Not captured") return "";
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function relatedHref(related: string) {
  if (related.startsWith("IT-")) return "/admin/jobs";
  if (related.startsWith("Q-")) return "/admin/quotes";
  if (related.startsWith("INV-")) return "/admin/invoices";
  if (related.startsWith("REQ-")) return "/admin/requests";
  return "/admin/followups";
}

function followupMessage(item: Followup) {
  return [
    `Hi ${item.customer},`,
    "",
    `Just following up: ${item.reason}`,
    item.related && item.related !== "Not linked" ? `Related record: ${item.related}` : "",
    "",
    "Regards,",
    "Omar",
    "OliveLink IT",
  ].filter(Boolean).join("\n");
}

function actionBucket(item: Followup) {
  if (item.status === "Completed") return "completed";
  if (item.status === "Waiting") return "waiting";
  if (item.status === "Overdue" || item.dueAt === "Yesterday") return "overdue";
  if (item.dueDateTime) {
    const dueTime = new Date(item.dueDateTime).getTime();
    if (!Number.isNaN(dueTime)) {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      if (dueTime < Date.now()) return "overdue";
      if (dueTime <= endOfToday.getTime()) return "due";
      return "upcoming";
    }
  }
  if (item.dueAt === "Today") return "due";
  if (item.status === "Scheduled" || item.status === "Planned" || item.dueAt.startsWith("Tomorrow") || item.dueAt.startsWith("Next week")) return "upcoming";
  if (item.status === "Due") return "due";
  return "upcoming";
}

function dateTimeLocalDaysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function displayDateTimeLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function FollowupsTable({ followups }: FollowupsTableProps) {
  const [items, setItems] = useState<Followup[]>(followups);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("active");
  const [channel, setChannel] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [outcome, setOutcome] = useState("");
  const [customDue, setCustomDue] = useState(dateTimeLocalDaysFromNow(1));
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => {
      const next = readFollowups(followups);
      setItems(next);
      setCustomers(readCustomerAndProspectRecords(baseCustomers));
      setSelectedId((current) => current && next.some((item) => item.id === current) ? current : "");
    };
    refresh();
    window.addEventListener("followups-updated", refresh);
    window.addEventListener("customers-updated", refresh);
    window.addEventListener("prospects-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("followups-updated", refresh);
      window.removeEventListener("customers-updated", refresh);
      window.removeEventListener("prospects-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [followups]);

  const statuses = useMemo(() => ["active", "due", "overdue", "waiting", "completed", "all"], []);
  const channels = useMemo(() => Array.from(new Set(items.map((item) => item.channel))).sort(), [items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const bucket = actionBucket(item);
      const matchesQuery = !needle || [item.customer, item.reason, item.related, item.channel, item.outcome ?? ""].some((value) => value.toLowerCase().includes(needle));
      const matchesStatus = status === "all" || (status === "active" ? bucket !== "completed" : bucket === status);
      const matchesChannel = channel === "all" || item.channel === channel;
      return matchesQuery && matchesStatus && matchesChannel;
    });
  }, [channel, items, query, status]);

  const selected = useMemo(() => items.find((item) => item.id === selectedId), [items, selectedId]);
  const selectedCustomer = selected ? contactFor(selected, customers) : undefined;
  const emailHref = selected && selectedCustomer?.email && selectedCustomer.email !== "Not captured"
    ? supportEmailHref(`Follow-up: ${selected.reason}`, followupMessage(selected), selectedCustomer.email)
    : "";
  const whatsApp = selected && selectedCustomer?.phone && selectedCustomer.phone !== "Not captured"
    ? whatsappHref(followupMessage(selected), selectedCustomer.phone)
    : null;
  const callHref = phoneHref(selectedCustomer?.phone);

  function refreshAfter(message: string) {
    const next = readFollowups(followups);
    setItems(next);
    setNotice(message);
  }

  function openItem(item: Followup) {
    setSelectedId(item.id);
    setOutcome(item.outcome ?? "");
    setCustomDue(item.dueDateTime || dateTimeLocalDaysFromNow(1));
    setNotice("");
  }

  function markContacted(action: string) {
    if (!selected) return;
    updateFollowupRecord(selected.id, { outcome: outcome || `${action} prepared.`, lastAction: `${action} - ${new Date().toLocaleString()}` });
    refreshAfter(`${selected.id} updated after ${action.toLowerCase()}.`);
  }

  function completeSelected() {
    if (!selected) return;
    completeFollowup(selected.id, outcome);
    setSelectedId("");
    setOutcome("");
    refreshAfter(`${selected.id} marked completed.`);
  }

  function waitingSelected() {
    if (!selected) return;
    markFollowupWaiting(selected.id, outcome);
    refreshAfter(`${selected.id} marked waiting.`);
  }

  function snoozeSelected(dueAt: string, dueDateTime?: string) {
    if (!selected || !dueAt) return;
    snoozeFollowup(selected.id, dueAt, outcome, dueDateTime);
    refreshAfter(`${selected.id} moved to ${dueAt}.`);
  }

  function snoozePreset(days: number) {
    const dueDateTime = dateTimeLocalDaysFromNow(days);
    snoozeSelected(displayDateTimeLocal(dueDateTime), dueDateTime);
  }

  function snoozeCustomDue() {
    const formatted = displayDateTimeLocal(customDue);
    if (!formatted) {
      setNotice("Choose a valid follow-up date and time.");
      return;
    }
    snoozeSelected(formatted, customDue);
  }

  return (
    <section className="work-panel">
      <div className="work-toolbar followup-toolbar">
        <label className="search-field">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, reason, job, quote, channel, outcome" />
        </label>
        <label>
          <span>View</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {statuses.map((value) => <option key={value} value={value}>{value === "all" ? "All follow-ups" : value[0].toUpperCase() + value.slice(1)}</option>)}
          </select>
        </label>
        <label>
          <span>Channel</span>
          <select value={channel} onChange={(event) => setChannel(event.target.value)}>
            <option value="all">All channels</option>
            {channels.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>
      {notice && <div className="workflow-notice">{notice}</div>}
      <div className="table-summary">
        <strong>{filtered.length}</strong> shown from {items.length} follow-ups
        <span>{items.filter((item) => actionBucket(item) === "due").length} due today</span>
      </div>
      <div className="data-table-wrap">
        <table className="data-table followups-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Reason</th>
              <th>Related</th>
              <th>Due</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Last outcome</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr className={item.id === selectedId ? "selected-row" : ""} key={item.id}>
                <td><strong>{item.customer}</strong><small>{item.id}</small></td>
                <td>{item.reason}</td>
                <td><Link className="table-link" href={relatedHref(item.related)}>{item.related}</Link></td>
                <td>{item.dueAt}</td>
                <td>{item.channel}</td>
                <td><span className={`pill ${item.tone}`}>{item.status}</span></td>
                <td>{item.outcome || item.lastAction || "Not contacted yet"}</td>
                <td className="table-actions">
                  <button className="table-link table-button" onClick={() => openItem(item)} type="button">Open</button>
                  {item.status !== "Completed" && <button className="table-link table-button" onClick={() => { completeFollowup(item.id, "Completed from list."); refreshAfter(`${item.id} marked completed.`); }} type="button">Done</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty-note">No follow-ups match the current filters.</div>}
      {selected && (
        <section className="followup-action-panel">
          <header>
            <div>
              <span>{selected.id} - {selected.related}</span>
              <h2>{selected.customer}</h2>
              <p>{selected.reason}</p>
            </div>
            <span className={`pill ${selected.tone}`}>{selected.status}</span>
          </header>
          <div className="followup-action-grid">
            <div className="followup-contact-card">
              <span>Contact</span>
              <strong>{selected.channel}</strong>
              <small>{selectedCustomer?.email && selectedCustomer.email !== "Not captured" ? selectedCustomer.email : "No email saved"}</small>
              <small>{selectedCustomer?.phone && selectedCustomer.phone !== "Not captured" ? selectedCustomer.phone : "No mobile saved"}</small>
              <div className="followup-buttons">
                <a className={whatsApp ? "button button-light button-small" : "button button-disabled button-small"} href={whatsApp || undefined} onClick={whatsApp ? () => markContacted("WhatsApp") : (event) => event.preventDefault()} rel="noreferrer" target="_blank">WhatsApp</a>
                <a className={emailHref ? "button button-ghost button-small" : "button button-disabled button-small"} href={emailHref || undefined} onClick={emailHref ? () => markContacted("Email") : (event) => event.preventDefault()}>Email</a>
                <a className={callHref ? "button button-ghost button-small" : "button button-disabled button-small"} href={callHref || undefined} onClick={callHref ? () => markContacted("Call") : (event) => event.preventDefault()}>Call</a>
                <Link className="button button-ghost button-small" href={relatedHref(selected.related)}>Open related</Link>
              </div>
            </div>
            <label className="followup-outcome">
              <span>Outcome notes</span>
              <textarea value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="Called, no answer. Customer approved quote. Waiting for laptop model..." rows={5} />
            </label>
            <div className="followup-next-actions">
              <span>Next action</span>
              <div>
                <button className="button" onClick={completeSelected} type="button">Mark done</button>
                <button className="button button-ghost" onClick={waitingSelected} type="button">Waiting</button>
                <button className="button button-ghost" onClick={() => snoozePreset(1)} type="button">Tomorrow</button>
                <button className="button button-ghost" onClick={() => snoozePreset(7)} type="button">Next week</button>
              </div>
              <label>
                <span>Custom due date and time</span>
                <input value={customDue} onChange={(event) => setCustomDue(event.target.value)} type="datetime-local" />
              </label>
              <button className="button button-ghost" onClick={snoozeCustomDue} type="button">Save custom due</button>
            </div>
            <div className="followup-convert-actions">
              <span>Convert</span>
              <Link className="next-step" href={`/admin/jobs/new?customer=${encodeURIComponent(selected.customer)}&details=${encodeURIComponent(selected.reason)}&requestId=${encodeURIComponent(selected.related)}`}><strong>Create job</strong><span>Use if the follow-up becomes real support work.</span></Link>
              <Link className="next-step" href={`/admin/quotes/new?customer=${encodeURIComponent(selected.customer)}&details=${encodeURIComponent(selected.reason)}&requestId=${encodeURIComponent(selected.related)}`}><strong>Create quote</strong><span>Use if the customer needs price or approval.</span></Link>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
