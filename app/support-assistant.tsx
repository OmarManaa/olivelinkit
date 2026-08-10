"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supportEmailHref, whatsappHref } from "./contact-config";
import { readInventoryItems } from "./inventory-store";
import { submitSupportRequest, type SupportRequest } from "./support-requests-store";
import { defaultWebsiteContent, type WebsiteContent } from "./website-content-data";
import { readWebsiteContent } from "./website-content-store";

type SupportAssistantProps = {
  initialContent?: WebsiteContent;
  initialInventory?: ReturnType<typeof readInventoryItems>;
};

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

type SelectedItem = NonNullable<SupportRequest["selectedItem"]>;

function numberFromParam(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function selectedItemParts(item: SelectedItem, includeName = true) {
  return [
    includeName ? item.name : "",
    item.sku ? `SKU ${item.sku}` : "",
    item.category,
    item.condition,
    typeof item.salePrice === "number" ? `$${item.salePrice}` : "",
    typeof item.quantity === "number" ? `${item.quantity} available` : "",
  ].filter(Boolean);
}

function selectedItemSummary(item: SelectedItem) {
  return selectedItemParts(item).join(" - ");
}

function selectedItemMetaSummary(item: SelectedItem) {
  return selectedItemParts(item, false).join(" - ");
}

export function SupportAssistant({ initialContent = defaultWebsiteContent, initialInventory = [] }: SupportAssistantProps) {
  const searchParams = useSearchParams();
  const requestedType = searchParams.get("requestType");
  const requestedIssueType = requestedType && issueTypes.includes(requestedType) ? requestedType : "";
  const selectedServiceParam = searchParams.get("service") ?? "";
  const selectedItemSku = searchParams.get("itemSku") ?? "";
  const selectedItemName = searchParams.get("itemName") ?? "";
  const selectedItemCategory = searchParams.get("itemCategory") ?? "";
  const selectedItemCondition = searchParams.get("itemCondition") ?? "";
  const selectedItemPrice = searchParams.get("itemPrice") ?? "";
  const selectedItemQuantity = searchParams.get("itemQuantity") ?? "";
  const [issueTypeOverride, setIssueTypeOverride] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [businessContext, setBusinessContext] = useState("");
  const [company, setCompany] = useState("");
  const [sentNotice, setSentNotice] = useState("");
  const [contactError, setContactError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState<WebsiteContent>(initialContent);
  const [inventoryItems, setInventoryItems] = useState<ReturnType<typeof readInventoryItems>>(initialInventory);
  const issueType = issueTypeOverride || requestedIssueType || issueTypes[0];
  const hasContact = Boolean(email.trim() || phone.trim());
  const hasName = Boolean(name.trim());

  const selectedItem = useMemo<SelectedItem | null>(() => {
    if (!selectedItemSku) return null;

    const item = inventoryItems.find((inventoryItem) => inventoryItem.sku === selectedItemSku);
    if (item) {
      return {
        sku: item.sku,
        name: item.name,
        category: item.category,
        condition: item.condition,
        salePrice: item.salePrice,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      };
    }

    return {
      sku: selectedItemSku,
      name: selectedItemName || selectedServiceParam || "Selected equipment",
      category: selectedItemCategory || undefined,
      condition: selectedItemCondition || undefined,
      salePrice: numberFromParam(selectedItemPrice),
      quantity: numberFromParam(selectedItemQuantity),
    };
  }, [inventoryItems, selectedItemCategory, selectedItemCondition, selectedItemName, selectedItemPrice, selectedItemQuantity, selectedItemSku, selectedServiceParam]);

  const selectedService = selectedItem?.name || selectedServiceParam;

  useEffect(() => {
    const refresh = () => setContent(readWebsiteContent());
    window.addEventListener("website-content-updated", refresh);
    return () => window.removeEventListener("website-content-updated", refresh);
  }, []);

  useEffect(() => {
    const refresh = () => setInventoryItems(readInventoryItems());
    window.addEventListener("inventory-items-updated", refresh);
    return () => window.removeEventListener("inventory-items-updated", refresh);
  }, []);

  const message = useMemo(() => {
    return [
      `Request type: ${issueType}`,
      selectedItem ? `Selected item: ${selectedItemSummary(selectedItem)}` : "",
      !selectedItem && selectedService ? `Selected service: ${selectedService}` : "",
      name ? `Name: ${name}` : "",
      email ? `Email: ${email}` : "",
      phone ? `Mobile: ${phone}` : "",
      businessContext ? `Business context: ${businessContext}` : "",
      details ? `Details: ${details}` : "",
    ].filter(Boolean).join("\n");
  }, [businessContext, details, email, issueType, name, phone, selectedItem, selectedService]);

  const whatsApp = whatsappHref(message, content.whatsappNumber);

  async function sendRequest() {
    if (!hasName || !hasContact) {
      setContactError(!hasName ? "Please provide your name so we know who to reply to." : "Please provide an email or mobile number so we can reply.");
      return false;
    }
    setIsSubmitting(true);
    setContactError("");
    setSentNotice("");
    try {
      const request = await submitSupportRequest({
        issueType,
        name,
        email,
        phone,
        details,
        businessContext,
        company,
        selectedService,
        selectedItem: selectedItem ?? undefined,
      });
      setSentNotice(`Reference ${request.id}. We'll review the details and get back to you shortly.`);
      return true;
    } catch (error) {
      setContactError(error instanceof Error ? error.message : "Your request could not be sent. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="assistant-panel" id="support-assistant">
      <div className="assistant-intro">
        <p className="eyebrow">{content.supportEyebrow}</p>
        <h2>{content.supportTitle}</h2>
        <p>{content.supportText}</p>
        <div className="assistant-points" aria-label="Support intake highlights">
          {content.supportPoints.map((point) => <span key={point}>{point}</span>)}
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
          <input aria-describedby={contactError ? "contact-error" : undefined} aria-invalid={Boolean(contactError) && !hasName} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name or business" autoComplete="name" required />
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
        {issueType === "Business IT" && (
          <label className="full">
            <span>Business context, optional</span>
            <input value={businessContext} onChange={(event) => setBusinessContext(event.target.value)} placeholder="For example: 8 staff, Microsoft 365, one office, Wi-Fi dropouts" />
          </label>
        )}
        <label className="form-honeypot" aria-hidden="true">
          <span>Company</span>
          <input autoComplete="off" onChange={(event) => setCompany(event.target.value)} tabIndex={-1} value={company} />
        </label>
        {contactError && <div className="assistant-error" id="contact-error">{contactError}</div>}
        {selectedItem ? (
          <div className="assistant-context">
            Selected item: <strong>{selectedItem.name}</strong>
            <span>{selectedItemMetaSummary(selectedItem)}</span>
          </div>
        ) : selectedService && (
          <div className="assistant-context">Selected service: <strong>{selectedService}</strong></div>
        )}
        {sentNotice && (
          <div className="assistant-saved" role="status">
            <strong>Request sent.</strong>
            <span>{sentNotice}</span>
          </div>
        )}
        <div className="assistant-actions">
          <button className="button" disabled={isSubmitting} onClick={() => { void sendRequest(); }} type="button">{isSubmitting ? "Sending request..." : "Send your request"}</button>
          {whatsApp ? <a aria-disabled={isSubmitting || undefined} className="button button-light" href={whatsApp} onClick={(event) => { event.preventDefault(); if (!isSubmitting) void sendRequest().then((sent) => { if (sent) window.location.assign(whatsApp); }); }}>WhatsApp message</a> : <span className="button button-disabled">WhatsApp unavailable</span>}
          <a aria-disabled={isSubmitting || undefined} className="button button-ghost" href={supportEmailHref(issueType, message, content.contactEmail)} onClick={(event) => { event.preventDefault(); if (!isSubmitting) { const href = supportEmailHref(issueType, message, content.contactEmail); void sendRequest().then((sent) => { if (sent) window.location.assign(href); }); } }}>Email request</a>
        </div>
        <p className="assistant-privacy">We use these details only to respond to your request. <a href="/privacy">Privacy</a></p>
      </form>
    </section>
  );
}
