"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supportEmailHref, whatsappHref } from "../contact-config";
import { scheduleFollowupFromSupportRequest } from "./followups-store";
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

function selectedContextSummary(request: SupportRequest) {
  if (request.selectedItem) {
    return [
      request.selectedItem.name,
      request.selectedItem.sku ? `SKU ${request.selectedItem.sku}` : "",
      request.selectedItem.category,
      request.selectedItem.condition,
      typeof request.selectedItem.salePrice === "number" ? `$${request.selectedItem.salePrice}` : "",
      typeof request.selectedItem.quantity === "number" ? `${request.selectedItem.quantity} available` : "",
    ].filter(Boolean).join(" - ");
  }
  return request.selectedService ?? "";
}

function conversionDetails(request: SupportRequest) {
  const selectedContext = selectedContextSummary(request);
  return [selectedContext ? `Clicked item/service: ${selectedContext}` : "", request.details].filter(Boolean).join("\n\n");
}

function templateFor(request: SupportRequest) {
  const base = templates[request.issueType as keyof typeof templates] ?? templates["Computer repair"];
  const selectedContext = selectedContextSummary(request);
  return `Hi ${request.name},\n\n${base}${selectedContext ? `\n\nClicked item/service:\n${selectedContext}` : ""}\n\nYour request summary:\n${request.details}\n\nRegards,\nOmar\nOliveLink IT`;
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
    details: conversionDetails(request),
  });
  if (request.email) params.set("email", request.email);
  if (request.phone) params.set("phone", request.phone);
  if (request.selectedItem) {
    params.set("device", request.selectedItem.name);
    params.set("quantity", "1");
    if (typeof request.selectedItem.salePrice === "number") params.set("unitPrice", String(request.selectedItem.salePrice));
  } else if (request.selectedService) {
    params.set("device", request.selectedService);
  }
  return `/admin/${type}/new?${params.toString()}`;
}

export function RequestsInbox() {
  const router = useRouter();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [statusFilter, setStatusFilter] = useState("Open");
  const [notice, setNotice] = useState("");

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

  async function markReplied() {
    if (!selected) return false;
    try {
      await updateSupportRequestStatus(selected.id, "Replied");
      setRequests(readSupportRequests());
      setNotice(`${selected.id} marked replied.`);
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The request could not be updated.");
      return false;
    }
  }

  async function openReplyChannel(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    if (await markReplied()) window.location.assign(href);
  }

  async function setStatus(status: SupportRequest["status"]) {
    if (!selected) return;
    try {
      await updateSupportRequestStatus(selected.id, status);
      const next = readSupportRequests();
      setRequests(next);
      setSelectedId(selected.id);
      setNotice(`${selected.id} moved to ${status.toLowerCase()}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The request could not be updated.");
    }
  }

  async function scheduleFollowup() {
    if (!selected) return;
    const followup = scheduleFollowupFromSupportRequest(selected);
    try {
      await updateSupportRequestStatus(selected.id, "Follow-up");
      setRequests(readSupportRequests());
      setNotice(`${followup?.id ?? "Follow-up"} scheduled for tomorrow. You can set an exact date and time in Follow-ups.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The request could not be updated.");
    }
  }

  async function convertToJob(request: SupportRequest) {
    const job = createJobFromSupportRequest(request);
    try {
      await updateSupportRequestStatus(request.id, "Converted");
      setRequests(readSupportRequests());
      setSelectedId(request.id);
      setNotice(`${request.id} converted to ${job.reference}.`);
      router.push(`/admin/jobs?created=${encodeURIComponent(job.reference)}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The request could not be updated.");
    }
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
            {selectedContextSummary(request) && <small>Clicked: {selectedContextSummary(request)}</small>}
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
          {selectedContextSummary(selected) && (
            <section>
              <h3>Clicked item/service</h3>
              <div className="request-context-card">
                <strong>{selected.selectedItem?.name ?? selected.selectedService}</strong>
                <span>{selectedContextSummary(selected)}</span>
              </div>
            </section>
          )}
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
              <button className="next-step" onClick={() => { void scheduleFollowup(); }} type="button"><strong>Schedule follow-up</strong><span>Creates a tomorrow task; set an exact date and time in Follow-ups.</span></button>
              <button className="next-step" onClick={() => { void convertToJob(selected); }} type="button"><strong>Convert to job</strong><span>Use when real repair/support work is required.</span></button>
              <Link className="next-step" href={conversionHref("quotes", selected)}><strong>Create quote</strong><span>Use when price, parts, or approval is needed first.</span></Link>
              <button className="next-step" onClick={() => { void setStatus("Closed"); }} type="button"><strong>Close request</strong><span>Use when the question is answered and no work is needed.</span></button>
            </div>
          </section>
          <div className="inbox-actions">
            {whatsApp && <a className="button button-light" href={whatsApp} onClick={(event) => { void openReplyChannel(event, whatsApp); }}>Reply by WhatsApp</a>}
            <a className={emailHref ? "button button-ghost" : "button button-disabled"} href={emailHref || undefined} onClick={emailHref ? (event) => { void openReplyChannel(event, emailHref); } : (event) => event.preventDefault()}>Reply by email</a>
            <button className="button button-ghost" onClick={() => { void markReplied(); }} type="button">Mark replied</button>
          </div>
          {notice && <div className="workflow-notice">{notice}</div>}
        </article>
      ) : (
        <div className="empty-note">No support requests match this view.</div>
      )}
    </section>
  );
}
