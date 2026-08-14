import Link from "next/link";
import { notFound } from "next/navigation";
import { adminSections, type AdminSection } from "../../../admin-data";
import { AdminRecordForm } from "./admin-record-form";

export const dynamic = "force-dynamic";

type NewPageProps = {
  params: Promise<{ section: string }>;
};

const fieldSets: Record<Exclude<AdminSection, "reports" | "requests">, string[]> = {
  jobs: ["Customer", "Device", "Issue", "Priority"],
  customers: ["Name", "Type", "Email", "Phone"],
  quotes: ["Customer", "Related job", "Description", "Expiry date"],
  invoices: ["Customer", "Related job", "Description", "Quantity", "Unit price"],
  inventory: ["SKU", "Item name", "Quantity", "Sale price"],
  equipment: ["Asset tag", "Model", "Condition", "Sale price"],
  followups: ["Customer", "Reason", "Related record", "Due date", "Channel", "Owner", "Status"],
};

function isCreatableSection(value: string): value is Exclude<AdminSection, "reports" | "requests"> {
  return value in fieldSets;
}

export default async function NewSectionRecordPage({ params }: NewPageProps) {
  const { section } = await params;
  if (!isCreatableSection(section)) notFound();

  const config = adminSections[section];

  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>{config.action}</h1>
          <small>{config.title} - create record</small>
        </div>
        <Link className="admin-action secondary" href={`/admin/${section}`}>Back to list</Link>
      </header>
      <div className="admin-content">
        <AdminRecordForm fields={fieldSets[section]} section={section} />
      </div>
    </>
  );
}
