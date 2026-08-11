"use client";

import { useEffect, useMemo, useState } from "react";
import { customers as baseCustomers, type Customer, type Invoice } from "./admin-data";
import { readCustomerAndProspectRecords } from "./customers-store";
import { readInvoices, updateInvoiceStatus } from "./invoices-store";
import { BrandLogo } from "../brand-logo";
import { defaultWebsiteContent, type WebsiteContent } from "../website-content-data";
import { readWebsiteContent } from "../website-content-store";

type InvoicesTableProps = {
  invoices: Invoice[];
};

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function customerForInvoice(invoice: Invoice, customers: Customer[]) {
  return customers.find((customer) => customer.name.toLowerCase() === invoice.customer.toLowerCase());
}

function invoiceTitle(settings: WebsiteContent) {
  return settings.invoiceIsTaxInvoice ? "Tax invoice" : "Invoice";
}

function invoiceText(invoice: Invoice, customer: Customer | undefined, settings: WebsiteContent) {
  return [
    `${invoiceTitle(settings)} ${invoice.reference}`,
    settings.businessLegalName,
    settings.businessAbn ? `ABN: ${settings.businessAbn}` : "",
    settings.businessAddress,
    settings.invoiceEmail ? `Email: ${settings.invoiceEmail}` : "",
    settings.businessPhone ? `Phone: ${settings.businessPhone}` : "",
    "",
    `Customer: ${invoice.customer}`,
    customer?.email && customer.email !== "Not captured" ? `Email: ${customer.email}` : "",
    customer?.phone && customer.phone !== "Not captured" ? `Mobile: ${customer.phone}` : "",
    `Related job: ${invoice.relatedJob}`,
    `Issued: ${invoice.issuedAt}`,
    `Due: ${invoice.dueAt}`,
    "",
    "Items:",
    ...invoice.items.map((item) => `${item.quantity} x ${item.description} @ ${formatMoney(item.unitPrice)} = ${formatMoney(item.quantity * item.unitPrice)}`),
    "",
    `Subtotal: ${formatMoney(invoice.subtotal)}`,
    `GST: ${formatMoney(invoice.gst)}`,
    `Total: ${formatMoney(invoice.total)}`,
    settings.invoicePaymentInstructions ? `\nPayment instructions:\n${settings.invoicePaymentInstructions}` : "",
    invoice.notes ? `\nNotes:\n${invoice.notes}` : "",
  ].filter(Boolean).join("\n");
}

function invoiceEmailHref(invoice: Invoice, customer: Customer | undefined, settings: WebsiteContent) {
  const email = customer?.email && customer.email !== "Not captured" ? customer.email : "";
  if (!email) return "";
  const body = [
    `Hi ${invoice.customer},`,
    "",
    `Please find ${invoiceTitle(settings).toLowerCase()} ${invoice.reference} below for ${invoice.items[0]?.description ?? "the completed work"}.`,
    "",
    invoiceText(invoice, customer, settings),
    "",
    "Regards,",
    "Omar",
    settings.businessLegalName,
  ].join("\n");
  return `mailto:${email}?${new URLSearchParams({ subject: `${invoiceTitle(settings)} ${invoice.reference} - ${formatMoney(invoice.total)}`, body }).toString()}`;
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const [records, setRecords] = useState<Invoice[]>(invoices);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<WebsiteContent>(defaultWebsiteContent);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedReference, setSelectedReference] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const refresh = () => {
      const nextRecords = [...readInvoices(), ...invoices];
      setRecords(nextRecords);
      setCustomers(readCustomerAndProspectRecords(baseCustomers));
      setSettings(readWebsiteContent());
    };
    refresh();
    window.addEventListener("invoices-updated", refresh);
    window.addEventListener("customers-updated", refresh);
    window.addEventListener("prospects-updated", refresh);
    window.addEventListener("website-content-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("invoices-updated", refresh);
      window.removeEventListener("customers-updated", refresh);
      window.removeEventListener("prospects-updated", refresh);
      window.removeEventListener("website-content-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [invoices]);

  const statuses = useMemo(() => Array.from(new Set(records.map((invoice) => invoice.status))).sort(), [records]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((invoice) => {
      const customer = customerForInvoice(invoice, customers);
      const matchesQuery = !needle || [invoice.reference, invoice.customer, customer?.email ?? "", customer?.phone ?? "", invoice.relatedJob, invoice.items[0]?.description ?? ""].some((value) => value.toLowerCase().includes(needle));
      const matchesStatus = status === "all" || invoice.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [customers, query, records, status]);

  const selectedInvoice = filtered.find((invoice) => invoice.reference === selectedReference);
  const selectedCustomer = selectedInvoice ? customerForInvoice(selectedInvoice, customers) : undefined;
  const emailHref = selectedInvoice ? invoiceEmailHref(selectedInvoice, selectedCustomer, settings) : "";

  function setStatusForSelected(nextStatus: Invoice["status"]) {
    if (!selectedInvoice) return;
    const updated = updateInvoiceStatus(selectedInvoice.reference, nextStatus);
    if (updated) {
      setRecords((current) => current.map((invoice) => invoice.reference === updated.reference ? updated : invoice));
      setSelectedReference(updated.reference);
    }
  }

  function previewInvoice(invoice: Invoice) {
    setSelectedReference(invoice.reference);
  }

  function printInvoice(invoice: Invoice) {
    setSelectedReference(invoice.reference);
    window.setTimeout(() => window.print(), 120);
  }

  async function copyInvoice() {
    if (!selectedInvoice) return;
    await navigator.clipboard.writeText(invoiceText(selectedInvoice, selectedCustomer, settings));
    setCopied(selectedInvoice.reference);
  }

  return (
    <section className="work-panel invoice-work-panel">
      <div className="work-toolbar quote-toolbar no-print">
        <label className="search-field">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice, customer, email, job, item" />
        </label>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>
      <div className="table-summary no-print">
        <strong>{filtered.length}</strong> shown from {records.length} invoices
        <span>{records.filter((invoice) => invoice.status === "Draft").length} draft invoices</span>
      </div>
      <div className="data-table-wrap no-print">
        <table className="data-table invoice-list-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Related job</th>
              <th>Status</th>
              <th>Total</th>
              <th>Due</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((invoice) => {
              const customer = customerForInvoice(invoice, customers);
              return (
                <tr className={invoice.reference === selectedInvoice?.reference ? "selected-row" : ""} key={invoice.reference}>
                  <td><strong>{invoice.reference}</strong><small>{invoice.items[0]?.description ?? "Invoice item"}</small></td>
                  <td>{invoice.customer}<small>{customer?.email && customer.email !== "Not captured" ? customer.email : "No email saved"}</small></td>
                  <td>{invoice.relatedJob}</td>
                  <td><span className={`pill ${invoice.tone}`}>{invoice.status}</span></td>
                  <td><strong>{formatMoney(invoice.total)}</strong></td>
                  <td>{invoice.dueAt}</td>
                  <td>{invoice.updatedAt}</td>
                  <td className="table-actions">
                    <button className="table-link table-button" onClick={() => previewInvoice(invoice)} type="button">Preview</button>
                    <button className="table-link table-button" onClick={() => printInvoice(invoice)} type="button">Print/PDF</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-note">No invoices match the current filters.</div>}
      </div>
      {selectedInvoice && (
        <div className="invoice-modal" role="dialog" aria-modal="true" aria-label={`Invoice preview ${selectedInvoice.reference}`}>
          <button aria-label="Close invoice preview" className="invoice-modal-backdrop no-print" onClick={() => setSelectedReference("")} type="button" />
          <div className="invoice-modal-shell">
            <div className="invoice-modal-top no-print">
              <div>
                <span>Invoice preview</span>
                <strong>{selectedInvoice.reference} - {selectedInvoice.customer}</strong>
              </div>
              <button className="admin-action secondary" onClick={() => setSelectedReference("")} type="button">Close</button>
            </div>
            <article className="invoice-preview">
            {!settings.businessAbn && settings.invoiceIsTaxInvoice && (
              <div className="invoice-warning no-print">ABN is missing. Add it in Admin - Website Content - Business and invoice details before sending a tax invoice.</div>
            )}
            <header className="invoice-header">
              <div>
                <BrandLogo alt={settings.logoAlt} src={settings.logoUrl} />
                <strong>{settings.businessLegalName}</strong>
                <small>{settings.businessAddress}</small>
                {settings.businessAbn && <small>ABN: {settings.businessAbn}</small>}
                {settings.invoiceEmail && <small>{settings.invoiceEmail}</small>}
                {settings.businessPhone && <small>{settings.businessPhone}</small>}
              </div>
              <div>
                <span>{invoiceTitle(settings)}</span>
                <h2>{selectedInvoice.reference}</h2>
                <p>{selectedInvoice.status}</p>
              </div>
            </header>
            <section className="invoice-meta">
              <div>
                <span>Bill to</span>
                <strong>{selectedInvoice.customer}</strong>
                <small>{selectedCustomer?.email && selectedCustomer.email !== "Not captured" ? selectedCustomer.email : "Email not saved"}</small>
                <small>{selectedCustomer?.phone && selectedCustomer.phone !== "Not captured" ? selectedCustomer.phone : ""}</small>
              </div>
              <div>
                <span>Issued</span>
                <strong>{selectedInvoice.issuedAt}</strong>
              </div>
              <div>
                <span>Due</span>
                <strong>{selectedInvoice.dueAt}</strong>
              </div>
              <div>
                <span>Related job</span>
                <strong>{selectedInvoice.relatedJob}</strong>
              </div>
            </section>
            <table className="invoice-lines">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item) => (
                  <tr key={`${item.description}-${item.unitPrice}`}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{formatMoney(item.unitPrice)}</td>
                    <td>{formatMoney(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <section className="invoice-bottom">
              <div>
                <span>Notes</span>
                <p>{selectedInvoice.notes || settings.invoiceFooterNote}</p>
                {settings.invoicePaymentInstructions && (
                  <>
                    <span>Payment</span>
                    <p>{settings.invoicePaymentInstructions}</p>
                  </>
                )}
              </div>
              <div className="invoice-totals">
                <p><span>Subtotal</span><strong>{formatMoney(selectedInvoice.subtotal)}</strong></p>
                <p><span>GST</span><strong>{formatMoney(selectedInvoice.gst)}</strong></p>
                <p className="grand-total"><span>Total</span><strong>{formatMoney(selectedInvoice.total)}</strong></p>
                {settings.invoiceIsTaxInvoice && <small>Total includes GST where applicable.</small>}
              </div>
            </section>
            <div className="invoice-actions no-print">
              <button className="button" onClick={() => printInvoice(selectedInvoice)} type="button">Print / save PDF</button>
              <a className={emailHref ? "button button-ghost" : "button button-disabled"} href={emailHref || undefined} onClick={emailHref ? () => setStatusForSelected("Sent") : (event) => event.preventDefault()}>Email customer</a>
              <button className="button button-ghost" onClick={copyInvoice} type="button">{copied === selectedInvoice.reference ? "Invoice copied" : "Copy invoice text"}</button>
              <button className="button button-ghost" onClick={() => setStatusForSelected("Sent")} type="button">Mark sent</button>
              <button className="button button-ghost" onClick={() => setStatusForSelected("Paid")} type="button">Mark paid</button>
              <button className="button button-ghost" onClick={() => setSelectedReference("")} type="button">Hide preview</button>
            </div>
          </article>
          </div>
        </div>
      )}
    </section>
  );
}
