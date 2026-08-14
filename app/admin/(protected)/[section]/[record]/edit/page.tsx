import Link from "next/link";
import { notFound } from "next/navigation";
import { adminSections, customers, followups, inventory, jobs, quotes, type AdminSection } from "../../../../admin-data";
import { InventoryItemForm } from "../../../../inventory-item-form";
import { CustomerRecordForm } from "../../../../customer-record-form";
import { JobRecordForm } from "../../../../job-record-form";
import { QuoteEditForm } from "../../../../quote-edit-form";

export const dynamic = "force-dynamic";

type EditRecordPageProps = {
  params: Promise<{ section: string; record: string }>;
};

function isEditableSection(value: string): value is Extract<AdminSection, "inventory" | "equipment" | "quotes" | "jobs" | "customers" | "followups"> {
  return value === "inventory" || value === "equipment" || value === "quotes" || value === "jobs" || value === "customers" || value === "followups";
}

export default async function EditRecordPage({ params }: EditRecordPageProps) {
  const { section, record } = await params;
  if (!isEditableSection(section)) notFound();

  const reference = decodeURIComponent(record);

  if (section === "followups") {
    const followup = followups.find((entry) => entry.id === reference);
    if (!followup) notFound();

    return (
      <>
        <header className="admin-topbar">
          <div>
            <h1>{followup.id}</h1>
            <small>{followup.customer} - {followup.reason}</small>
          </div>
          <Link className="admin-action secondary" href="/admin/followups">Back to follow-ups</Link>
        </header>
        <div className="admin-content">
          <form className="admin-form quote-form">
            <label><span>Customer</span><input defaultValue={followup.customer} /></label>
            <label><span>Status</span><select defaultValue={followup.status}><option>Planned</option><option>Scheduled</option><option>Due</option><option>Completed</option></select></label>
            <label><span>Related record</span><input defaultValue={followup.related} /></label>
            <label><span>Due</span><input defaultValue={followup.dueAt} /></label>
            <label><span>Channel</span><select defaultValue={followup.channel}><option>WhatsApp</option><option>Email</option><option>Phone</option></select></label>
            <label><span>Owner</span><input defaultValue={followup.owner} /></label>
            <label className="full"><span>Reason</span><textarea defaultValue={followup.reason} rows={5} /></label>
            <div className="form-actions">
              <Link className="button button-ghost" href="/admin/followups">Cancel</Link>
              <Link className="button" href="/admin/followups">Save follow-up</Link>
            </div>
          </form>
        </div>
      </>
    );
  }

  if (section === "customers") {
    const customer = customers.find((entry) => entry.id === reference);

    return (
      <>
        <header className="admin-topbar">
          <div>
            <h1>{customer?.name ?? "Edit customer"}</h1>
            <small>{customer ? `${customer.id} - ${customer.type} customer` : reference}</small>
          </div>
          <Link className="admin-action secondary" href="/admin/customers">Back to customers</Link>
        </header>
        <div className="admin-content">
          <CustomerRecordForm customerId={reference} initialCustomer={customer} />
        </div>
      </>
    );
  }

  if (section === "jobs") {
    const job = jobs.find((entry) => entry.reference === reference);

    return (
      <>
        <header className="admin-topbar">
          <div>
            <h1>{job ? `Open ${job.reference}` : "Edit job"}</h1>
            <small>{job ? `${job.customer} - ${job.issue}` : reference}</small>
          </div>
          <Link className="admin-action secondary" href="/admin/jobs">Back to jobs</Link>
        </header>
        <div className="admin-content">
          <JobRecordForm initialJob={job} jobReference={reference} />
        </div>
      </>
    );
  }

  if (section === "quotes") {
    const quote = quotes.find((entry) => entry.reference === reference);
    if (!quote) notFound();

    return (
      <>
        <header className="admin-topbar">
          <div>
            <h1>Edit {quote.reference}</h1>
            <small>{quote.customer} - {quote.title}</small>
          </div>
          <Link className="admin-action secondary" href="/admin/quotes">Back to quotes</Link>
        </header>
        <div className="admin-content">
          <QuoteEditForm quote={quote} customers={customers} jobs={jobs} />
        </div>
      </>
    );
  }

  const item = inventory.find((entry) => entry.sku === reference && (section === "inventory" || entry.type === "Equipment"));

  const config = adminSections[section];

  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Edit {item?.name ?? reference}</h1>
          <small>{config.title} - {item?.sku ?? reference}</small>
        </div>
        <Link className="admin-action secondary" href={`/admin/${section}`}>Back to list</Link>
      </header>
      <div className="admin-content">
        <InventoryItemForm initialItem={item} mode={section} sku={reference} />
      </div>
    </>
  );
}
