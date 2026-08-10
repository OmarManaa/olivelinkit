"use client";

import { useEffect, useMemo, useState } from "react";
import { readInventoryItems } from "../inventory-store";
import type { Followup, InventoryItem, Invoice, Job, Quote } from "./admin-data";
import { readFollowups } from "./followups-store";
import { readInvoices } from "./invoices-store";
import { readJobs } from "./jobs-store";
import { readQuoteDrafts } from "./quotes-store";

export type ReportingSeeds = {
  jobs: Job[];
  quotes: Quote[];
  invoices: Invoice[];
  followups: Followup[];
  inventory: InventoryItem[];
};

export type ReportingData = ReportingSeeds & {
  activeJobs: Job[];
  dueToday: Job[];
  highPriority: Job[];
  waitingParts: Job[];
  readyJobs: Job[];
  pendingQuotes: Quote[];
  openInvoices: Invoice[];
  paidInvoices: Invoice[];
  dueFollowups: Followup[];
  lowStock: InventoryItem[];
  quotePipeline: number;
  openInvoiceTotal: number;
  paidTotal: number;
};

function byReference<T extends { reference: string }>(baseRecords: T[], savedRecords: T[]) {
  const records = new Map<string, T>();
  for (const record of [...baseRecords, ...savedRecords]) records.set(record.reference, record);
  return Array.from(records.values());
}

function followupNeedsAction(followup: Followup) {
  return followup.status === "Due" || followup.status === "Overdue" || followup.dueAt === "Today";
}

export function money(value: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(value);
}

export function reportDate() {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function useReportingData({ jobs, quotes, invoices, followups, inventory }: ReportingSeeds): ReportingData {
  const [jobRecords, setJobRecords] = useState<Job[]>(jobs);
  const [quoteRecords, setQuoteRecords] = useState<Quote[]>(quotes);
  const [invoiceRecords, setInvoiceRecords] = useState<Invoice[]>(invoices);
  const [followupRecords, setFollowupRecords] = useState<Followup[]>(followups);
  const [inventoryRecords, setInventoryRecords] = useState<InventoryItem[]>(inventory);

  useEffect(() => {
    const refresh = () => {
      setJobRecords(readJobs(jobs));
      setQuoteRecords(byReference(quotes, readQuoteDrafts()));
      setInvoiceRecords(byReference(invoices, readInvoices()));
      setFollowupRecords(readFollowups(followups));
      setInventoryRecords(readInventoryItems());
    };

    refresh();
    window.addEventListener("jobs-updated", refresh);
    window.addEventListener("quote-drafts-updated", refresh);
    window.addEventListener("invoices-updated", refresh);
    window.addEventListener("followups-updated", refresh);
    window.addEventListener("inventory-items-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("jobs-updated", refresh);
      window.removeEventListener("quote-drafts-updated", refresh);
      window.removeEventListener("invoices-updated", refresh);
      window.removeEventListener("followups-updated", refresh);
      window.removeEventListener("inventory-items-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [followups, inventory, invoices, jobs, quotes]);

  return useMemo(() => {
    const activeJobs = jobRecords.filter((job) => job.status !== "Completed" && !job.archivedAt);
    const dueToday = activeJobs.filter((job) => job.dueAt === "Today");
    const highPriority = activeJobs.filter((job) => job.priority === "High");
    const waitingParts = activeJobs.filter((job) => job.status === "Waiting parts");
    const readyJobs = activeJobs.filter((job) => job.status === "Ready");
    const pendingQuotes = quoteRecords.filter((quote) => quote.status === "Draft" || quote.status === "Sent");
    const openInvoices = invoiceRecords.filter((invoice) => invoice.status === "Draft" || invoice.status === "Sent");
    const paidInvoices = invoiceRecords.filter((invoice) => invoice.status === "Paid");
    const dueFollowups = followupRecords.filter(followupNeedsAction);
    const lowStock = inventoryRecords.filter((item) => item.quantity <= item.reorderLevel);

    return {
      jobs: jobRecords,
      quotes: quoteRecords,
      invoices: invoiceRecords,
      followups: followupRecords,
      inventory: inventoryRecords,
      activeJobs,
      dueToday,
      highPriority,
      waitingParts,
      readyJobs,
      pendingQuotes,
      openInvoices,
      paidInvoices,
      dueFollowups,
      lowStock,
      quotePipeline: pendingQuotes.reduce((total, quote) => total + quote.total, 0),
      openInvoiceTotal: openInvoices.reduce((total, invoice) => total + invoice.total, 0),
      paidTotal: paidInvoices.reduce((total, invoice) => total + invoice.total, 0),
    };
  }, [followupRecords, inventoryRecords, invoiceRecords, jobRecords, quoteRecords]);
}
