import { notFound } from "next/navigation";
import Link from "next/link";
import { adminSections, customers, followups, inventory, jobs, quotes, type AdminSection } from "../admin-data";
import { InventoryTable } from "../inventory-table";
import { QuotesTable } from "../quotes-table";
import { RequestsInbox } from "../requests-inbox";
import { JobsTable } from "../jobs-table";
import { CustomersTable } from "../customers-table";
import { FollowupsTable } from "../followups-table";

export const dynamic = "force-dynamic";

type SectionPageProps = {
  params: Promise<{ section: string }>;
};

function isSection(value: string): value is AdminSection {
  return value in adminSections;
}

function StatusPill({ label, tone = "gray" }: { label: string; tone?: string }) {
  return <span className={`pill ${tone}`}>{label}</span>;
}

function JobsView() {
  return <JobsTable jobs={jobs} />;
}

function CustomersView() {
  return <CustomersTable customers={customers} />;
}

function QuotesView() {
  return <QuotesTable quotes={quotes} />;
}

function InventoryView({ equipmentOnly = false }: { equipmentOnly?: boolean }) {
  const rows = equipmentOnly ? inventory.filter((item) => item.type === "Equipment") : inventory;
  return <InventoryTable items={rows} mode={equipmentOnly ? "equipment" : "inventory"} />;
}

function FollowupsView() {
  return <FollowupsTable followups={followups} />;
}

function ReportsView() {
  return <>
    <section className="report-grid"><article><span>Monthly revenue</span><strong>$2,450</strong><small>+12% from last month</small></article><article><span>Completion rate</span><strong>86%</strong><small>6 completed today</small></article><article><span>Open workload</span><strong>14</strong><small>4 currently in progress</small></article></section>
    <section className="review-panel">
      <h2>Site Review Priorities</h2>
      <ul>
        <li><strong>Inventory scale:</strong> use dense tables, search, filters, edit actions, low-stock alerts, and bulk workflows for large catalogues.</li>
        <li><strong>Quote accuracy:</strong> select customers, devices, jobs, and inventory items from existing records instead of typing names manually.</li>
        <li><strong>Public conversion:</strong> keep WhatsApp for fast questions and email for formal quote/support requests with structured details.</li>
        <li><strong>AI layer:</strong> add support triage, quote drafting, reply suggestions, and job-note summaries once server-side persistence is connected.</li>
      </ul>
    </section>
  </>;
}

function renderSection(section: AdminSection) {
  if (section === "requests") return <RequestsInbox />;
  if (section === "jobs") return <JobsView />;
  if (section === "customers") return <CustomersView />;
  if (section === "quotes") return <QuotesView />;
  if (section === "inventory") return <InventoryView />;
  if (section === "equipment") return <InventoryView equipmentOnly />;
  if (section === "followups") return <FollowupsView />;
  return <ReportsView />;
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section } = await params;
  if (!isSection(section)) notFound();
  const config = adminSections[section];

  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>{config.title}</h1>
          <small>{config.subtitle}</small>
        </div>
        <Link className="admin-action" href={config.actionHref}>{config.action}</Link>
      </header>
      <div className="admin-content">{renderSection(section)}</div>
    </>
  );
}
