"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supportEmailHref, whatsappHref } from "../contact-config";
import { createJobFromSupportRequest } from "./jobs-store";
import { readSupportRequests, type SupportRequest, updateSupportRequestStatus } from "../support-requests-store";
import Link from "next/link";

const templates = {
  "Business IT": "Thanks for getting in touch. I can help review the business IT issue and suggest the best next step. Please send the affected users/devices, any error messages, how urgent it is, and whether remote access is available.",
  "Network or Wi-Fi": "Thanks for the details. For Wi-Fi or network issues, please send the router/NBN model, where the dropouts happen, how many devices are affected, and whether the issue is constant or intermittent.",
  "Microsoft 365 or email": "Thanks for the request. For Microsoft 365 or email work, please send the affected mailbox addresses, any bounce/error messages, and whether you need migration, troubleshooting, or security review.",
  "Quote request": "Thanks for requesting a quote. I can prepare a clear estimate once I confirm the device/service details, urgency, preferred timing, and whether parts or onsite work are required.",
  "Equipment enquiry": "Thanks for the equipment enquiry. I can confirm availability, condition, specifications, warranty, and setup options. Please let me know what the equipment will be used for and your budget range.",
  "Computer repair": "Thanks for the repair request. Please send the device model, symptoms, any recent changes, whether data backup is required, and how urgent the repair is.",
  "Security": "Thanks for the security request. Please send the affected accounts/devices, any alerts or suspicious activity, current antivirus/MFA status, and whether this is urgent.",
  "Remote support": "Thanks for requesting remote support. Please send the device type, symptoms, any error messages, your availability, and whether remote access is already installed.",
};

function templateFor(request: SupportRequest) {
  const base = templates[request.issueType as keyof typeof templates] ?? templates["Computer repair"];
  return `Hi ${request.name},\n\n${base}\n\nYour request summary:\n${request.details}\n\nRegards,\nOmar\nHome & Small Business IT Services`;
}

function contactSummary(request: SupportRequest) {
  return [request.email, request.phone].filter(Boolean).join(" - ") || "No contact captured";
}

function conversionHref(type: "jobs" | "quotes", request: SupportRequest) {
  const params = new URLSearchParams({
    source: "support-request",
    requestId: request.id,
    customer: request.name,
    issueType: request.issueType,
    details: request.details,
  });
  if (request.email) params.set("email", request.email);
  if (request.phone) params.set("phone", request.phone);
  return `/admin/${type}/new?${params.toString()}`;
}

export function RequestsInbox() {
  const router = useRouter();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [statusFilter, setStatusFilter] = useState("Open");

  useEffect(() => {
    const refresh = () => {
      const next = readSupportRequests();
      setRequests(next);
      setSelectedId((current) => current || next[0]?.id || "");
    };
    refresh();
    window.addEventListener("support-requests-updated", refresh);
    return () => window.removeEventListener("support-requests-updated", refresh);
  }, []);

  const visibleRequests = useMemo(() => {
    if (statusFilter === "All") return requests;
    if (statusFilter === "Open") return requests.filter((request) => request.status !== "Closed" && request.status !== "Converted");
    return requests.filter((request) => request.status === statusFilter);
  }, [requests, statusFilter]);

  const selected = useMemo(() => visibleRequests.find((request) => request.id === selectedId) ?? visibleRequests[0], [selectedId, visibleRequests]);
  const reply = selected ? templateFor(selected) : "";
  const whatsApp = selected?.phone ? whatsappHref(reply, selected.phone) : null;
  const emailHref = selected?.email ? supportEmailHref(`Re: ${selected.issueType}`, reply, selected.email) : "";

  function markReplied() {
    if (!selected) return;
    updateSupportRequestStatus(selected.id, "Replied");
    setRequests(readSupportRequests());
  }

  function setStatus(status: SupportRequest["status"]) {
    if (!selected) return;
    updateSupportRequestStatus(selected.id, status);
    const next = readSupportRequests();
    setRequests(next);
    setSelectedId(selected.id);
  }

  function convertToJob(request: SupportRequest) {
    const job = createJobFromSupportRequest(request);
    updateSupportRequestStatus(request.id, "Converted");
    setRequests(readSupportRequests());
    setSelectedId(request.id);
    router.push(`/admin/jobs?created=${encodeURIComponent(job.reference)}`);
  }

  return (
    <section className="inbox-layout">
      <aside className="inbox-list">
        <div className="inbox-head">
          <strong>{visibleRequests.length}</strong>
          <span>{statusFilter.toLowerCase()} requests</span>
        </div>
        <div className="inbox-filters">
          {["Open", "New", "Replied", "Follow-up", "Converted", "Closed", "All"].map((status) => (
            <button className={statusFilter === status ? "active" : ""} key={status} onClick={() => setStatusFilter(status)} type="button">{status}</button>
          ))}
        </div>
        {visibleRequests.map((request) => (
          <button className={request.id === selected?.id ? "active" : ""} key={request.id} onClick={() => setSelectedId(request.id)} type="button">
            <strong>{request.name}</strong>
            <span>{request.issueType}</span>
            <small>{contactSummary(request)}</small>
            <small>{request.status} - {request.lastAction ?? request.createdAt}</small>
          </button>
        ))}
      </aside>
      {selected ? (
        <article className="inbox-detail">
          <header>
            <div>
              <h2>{selected.name}</h2>
              <span>{selected.id} - {selected.issueType}</span>
            </div>
            <span className={`pill ${selected.status === "New" ? "amber" : "green"}`}>{selected.status}</span>
          </header>
          <section>
            <h3>Customer contact</h3>
            <p>{contactSummary(selected)}</p>
          </section>
          <section>
            <h3>Customer question</h3>
            <p>{selected.details}</p>
          </section>
          <section>
            <h3>Tailored reply template</h3>
            <textarea readOnly rows={9} value={reply} />
          </section>
          <section className="next-step-panel">
            <h3>After responding</h3>
            <div>
              <button className="next-step" onClick={() => setStatus("Follow-up")} type="button"><strong>Schedule follow-up</strong><span>Use when you need customer details, timing, or approval.</span></button>
              <button className="next-step" onClick={() => convertToJob(selected)} type="button"><strong>Convert to job</strong><span>Use when real repair/support work is required.</span></button>
              <Link className="next-step" href={conversionHref("quotes", selected)} onClick={() => setStatus("Converted")}><strong>Create quote</strong><span>Use when price, parts, or approval is needed first.</span></Link>
              <button className="next-step" onClick={() => setStatus("Closed")} type="button"><strong>Close request</strong><span>Use when the question is answered and no work is needed.</span></button>
            </div>
          </section>
          <div className="inbox-actions">
            {whatsApp && <a className="button button-light" href={whatsApp} onClick={markReplied}>Reply by WhatsApp</a>}
            <a className={emailHref ? "button button-ghost" : "button button-disabled"} href={emailHref || undefined} onClick={emailHref ? markReplied : (event) => event.preventDefault()}>Reply by email</a>
            <button className="button button-ghost" onClick={markReplied} type="button">Mark replied</button>
          </div>
        </article>
      ) : (
        <div className="empty-note">No support requests match this view.</div>
      )}
    </section>
  );
}
