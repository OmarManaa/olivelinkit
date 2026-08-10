import { notFound } from "next/navigation";
import Link from "next/link";
import { adminSections, customers, followups, inventory, invoices, jobs, quotes, type AdminSection } from "../admin-data";
import { InventoryTable } from "../inventory-table";
import { InvoicesTable } from "../invoices-table";
import { QuotesTable } from "../quotes-table";
import { RequestsInbox } from "../requests-inbox";
import { JobsTable } from "../jobs-table";
import { CustomersTable } from "../customers-table";
import { FollowupsTable } from "../followups-table";
import { ReportsConsole } from "../reports-console";

export const dynamic = "force-dynamic";

type SectionPageProps = {
  params: Promise<{ section: string }>;
};

function isSection(value: string): value is AdminSection {
  return value in adminSections;
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

function InvoicesView() {
  return <InvoicesTable invoices={invoices} />;
}

function InventoryView({ equipmentOnly = false }: { equipmentOnly?: boolean }) {
  const rows = equipmentOnly ? inventory.filter((item) => item.type === "Equipment") : inventory;
  return <InventoryTable items={rows} mode={equipmentOnly ? "equipment" : "inventory"} />;
}

function FollowupsView() {
  return <FollowupsTable followups={followups} />;
}

function ReportsView() {
  return <ReportsConsole followups={followups} inventory={inventory} invoices={invoices} jobs={jobs} quotes={quotes} />;
}

function renderSection(section: AdminSection) {
  if (section === "requests") return <RequestsInbox />;
  if (section === "jobs") return <JobsView />;
  if (section === "customers") return <CustomersView />;
  if (section === "quotes") return <QuotesView />;
  if (section === "invoices") return <InvoicesView />;
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
