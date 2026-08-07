"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supportEmailHref, whatsappHref } from "./contact-config";
import { saveSupportRequest } from "./support-requests-store";
import { defaultWebsiteContent, type WebsiteContent } from "./website-content-data";
import { readWebsiteContent } from "./website-content-store";

const issueTypes = [
  "Computer repair",
  "Business IT",
  "Network or Wi-Fi",
  "Microsoft 365 or email",
  "Security",
  "Remote support",
  "Quote request",
  "Equipment enquiry",
];

export function SupportAssistant() {
  const searchParams = useSearchParams();
  const requestedType = searchParams.get("requestType");
  const requestedIssueType = requestedType && issueTypes.includes(requestedType) ? requestedType : "";
  const [issueTypeOverride, setIssueTypeOverride] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [sentNotice, setSentNotice] = useState("");
  const [contactError, setContactError] = useState("");
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent);
  const selectedService = searchParams.get("service") ?? "";
  const issueType = issueTypeOverride || requestedIssueType || issueTypes[0];
  const hasContact = Boolean(email.trim() || phone.trim());

  useEffect(() => {
    const refresh = () => setContent(readWebsiteContent());
    refresh();
    window.addEventListener("website-content-updated", refresh);
    return () => window.removeEventListener("website-content-updated", refresh);
  }, []);

  const message = useMemo(() => {
    return [
      `Request type: ${issueType}`,
      name ? `Name: ${name}` : "",
      email ? `Email: ${email}` : "",
      phone ? `Mobile: ${phone}` : "",
      details ? `Details: ${details}` : "",
    ].filter(Boolean).join("\n");
  }, [details, email, issueType, name, phone]);

  const whatsApp = whatsappHref(message, content.whatsappNumber);

  function sendRequest() {
    if (!hasContact) {
      setContactError("Please provide an email or mobile number so we can reply.");
      return false;
    }
    saveSupportRequest({ issueType, name, email, phone, details });
    setContactError("");
    setSentNotice("We'll review the details and get back to you shortly.");
    return true;
  }

  return (
    <section className="assistant-panel" id="support-assistant">
      <div className="assistant-intro">
        <p className="eyebrow">QUICK INTAKE</p>
        <h2>Start with the right details.</h2>
        <p>Choose what you need, add the key symptoms, then send it through the best channel.</p>
        <div className="assistant-points" aria-label="Support intake highlights">
          <span>Remote help</span>
          <span>Onsite visits</span>
          <span>Quote ready</span>
        </div>
      </div>
      <form className="assistant-form">
        <label>
          <span>Request type</span>
          <select value={issueType} onChange={(event) => setIssueTypeOverride(event.target.value)}>
            {issueTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label>
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name or business" autoComplete="name" />
        </label>
        <label>
          <span>Email</span>
          <input
            aria-describedby={contactError ? "contact-error" : undefined}
            aria-invalid={Boolean(contactError)}
            autoComplete="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
        </label>
        <label>
          <span>Mobile</span>
          <input
            aria-describedby={contactError ? "contact-error" : undefined}
            aria-invalid={Boolean(contactError)}
            autoComplete="tel"
            inputMode="tel"
            onChange={(event) => setPhone(event.target.value)}
            placeholder="04xx xxx xxx"
            type="tel"
            value={phone}
          />
        </label>
        <label className="full">
          <span>What is happening?</span>
          <textarea value={details} onChange={(event) => setDetails(event.target.value)} placeholder={selectedService ? `Tell us what you need for ${selectedService}: device/users affected, urgency, location, and best contact method` : "Device, error message, urgency, location, or quote details"} rows={4} />
        </label>
        {contactError && <div className="assistant-error" id="contact-error">{contactError}</div>}
        {selectedService && <div className="assistant-context">Selected service: <strong>{selectedService}</strong></div>}
        {sentNotice && (
          <div className="assistant-saved" role="status">
            <strong>Request sent.</strong>
            <span>{sentNotice}</span>
          </div>
        )}
        <div className="assistant-actions">
          <button className="button" onClick={sendRequest} type="button">Send your request</button>
          {whatsApp ? <a className="button button-light" href={whatsApp} onClick={(event) => { if (!sendRequest()) event.preventDefault(); }}>WhatsApp message</a> : <span className="button button-disabled">WhatsApp unavailable</span>}
          <a className="button button-ghost" href={supportEmailHref(issueType, message, content.contactEmail)} onClick={(event) => { if (!sendRequest()) event.preventDefault(); }}>Email request</a>
        </div>
      </form>
    </section>
  );
}
