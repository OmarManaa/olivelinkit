"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Customer, Quote } from "./admin-data";
import { readCustomerAndProspectRecords } from "./customers-store";
import { markQuoteSent, readQuoteDrafts } from "./quotes-store";

type QuoteSendPanelProps = {
  quotes: Quote[];
  customers: Customer[];
};

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function customerPhoneForWhatsApp(phone?: string) {
  if (!phone || phone === "Not captured") return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("61")) return digits;
  if (digits.startsWith("0")) return `61${digits.slice(1)}`;
  return digits;
}

export function QuoteSendPanel({ quotes, customers }: QuoteSendPanelProps) {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? "";
  const [drafts, setDrafts] = useState<Quote[]>([]);
  const [customerRecords, setCustomerRecords] = useState<Customer[]>(customers);
  const [copied, setCopied] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setDrafts(readQuoteDrafts());
      setCustomerRecords(readCustomerAndProspectRecords(customers));
    };
    refresh();
    window.addEventListener("quote-drafts-updated", refresh);
    window.addEventListener("customers-updated", refresh);
    window.addEventListener("prospects-updated", refresh);
    return () => {
      window.removeEventListener("quote-drafts-updated", refresh);
      window.removeEventListener("customers-updated", refresh);
      window.removeEventListener("prospects-updated", refresh);
    };
  }, [customers]);

  const quote = useMemo(() => {
    return drafts.find((item) => item.reference === reference) || quotes.find((item) => item.reference === reference);
  }, [drafts, quotes, reference]);

  const customer = useMemo(() => {
    return quote ? customerRecords.find((item) => item.name.toLowerCase() === quote.customer.toLowerCase()) : undefined;
  }, [customerRecords, quote]);

  if (!quote) {
    return (
      <section className="send-panel">
        <h2>Quote not found</h2>
        <p>This quote may only exist in another browser or it has not been saved yet.</p>
        <Link className="button" href="/admin/quotes">Back to quotes</Link>
      </section>
    );
  }

  const email = customer?.email && customer.email !== "Not captured" ? customer.email : "";
  const phone = customerPhoneForWhatsApp(customer?.phone);
  const subject = `Quote ${quote.reference} - ${quote.title}`;
  const emailBody = [
    `Hi ${quote.customer},`,
    "",
    "Thanks for your request. I have prepared the quote below.",
    "",
    `Quote: ${quote.reference}`,
    `Work: ${quote.title}`,
    `Related record: ${quote.relatedJob}`,
    `Subtotal: ${formatMoney(quote.subtotal)}`,
    `GST: ${formatMoney(quote.gst)}`,
    `Total: ${formatMoney(quote.total)} including GST`,
    `Expiry: ${quote.expiresAt}`,
    "",
    "Please reply to approve the quote, or let me know if you have any questions.",
    "",
    "Regards,",
    "Omar",
    "OliveLink IT",
  ].join("\n");
  const whatsappBody = `Hi ${quote.customer}, I have prepared quote ${quote.reference} for ${quote.title}. Total is ${formatMoney(quote.total)} including GST, expiring ${quote.expiresAt}. I have sent the details by email. Please reply if you approve or have any questions. Regards, Omar`;
  const emailHref = `mailto:${email}?${new URLSearchParams({ subject, body: emailBody }).toString()}`;
  const whatsappHref = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappBody)}` : "";

  async function copyText(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
  }

  function markSent() {
    if (!quote) return;
    markQuoteSent(quote);
    setSent(true);
  }

  return (
    <section className="send-layout">
      <div className="send-panel">
        <header>
          <div>
            <span>{quote.reference}</span>
            <h2>{quote.title}</h2>
            <p>{quote.customer} - {formatMoney(quote.total)} including GST</p>
          </div>
          <span className={`pill ${sent || quote.status === "Sent" ? "amber" : quote.tone}`}>{sent ? "Sent" : quote.status}</span>
        </header>
        <div className="send-summary">
          <div><span>Customer email</span><strong>{email || "Not captured"}</strong></div>
          <div><span>Customer phone</span><strong>{customer?.phone || "Not captured"}</strong></div>
          <div><span>Expiry</span><strong>{quote.expiresAt}</strong></div>
          <div><span>Total</span><strong>{formatMoney(quote.total)}</strong></div>
        </div>
        <div className="send-actions">
          <a className={email ? "button" : "button button-disabled"} href={email ? emailHref : undefined} onClick={email ? undefined : (event) => event.preventDefault()}>Open email</a>
          <button className="button button-ghost" onClick={() => copyText("email", emailBody)} type="button">{copied === "email" ? "Email copied" : "Copy email"}</button>
          <a className={phone ? "button button-ghost" : "button button-disabled"} href={whatsappHref || undefined} onClick={phone ? undefined : (event) => event.preventDefault()} target="_blank">Open WhatsApp</a>
          <button className="button button-ghost" onClick={() => copyText("whatsapp", whatsappBody)} type="button">{copied === "whatsapp" ? "WhatsApp copied" : "Copy WhatsApp"}</button>
          <button className="button" onClick={markSent} type="button">{sent ? "Marked sent" : "Mark as sent"}</button>
        </div>
      </div>
      <div className="send-panel">
        <h3>Email preview</h3>
        <textarea readOnly rows={16} value={emailBody} />
      </div>
      <div className="send-panel">
        <h3>WhatsApp preview</h3>
        <textarea readOnly rows={7} value={whatsappBody} />
      </div>
    </section>
  );
}
