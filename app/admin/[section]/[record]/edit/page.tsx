import Link from "next/link";
import { notFound } from "next/navigation";
import { adminSections, customers, followups, inventory, jobs, quotes, type AdminSection } from "../../../admin-data";
import { InventoryItemForm } from "../../../inventory-item-form";
import { QuoteEditForm } from "../../../quote-edit-form";

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
    if (!customer) notFound();

    return (
      <>
        <header className="admin-topbar">
          <div>
            <h1>{customer.name}</h1>
            <small>{customer.id} - {customer.type} customer</small>
          </div>
          <Link className="admin-action secondary" href="/admin/customers">Back to customers</Link>
        </header>
        <div className="admin-content">
          <form className="admin-form quote-form">
            <label>
              <span>Customer ID</span>
              <input defaultValue={customer.id} />
            </label>
            <label>
              <span>Customer type</span>
              <select defaultValue={customer.type}>
                <option>Home</option>
                <option>Business</option>
              </select>
            </label>
            <label>
              <span>Name</span>
              <input defaultValue={customer.name} />
            </label>
            <label>
              <span>Email</span>
              <input defaultValue={customer.email} type="email" />
            </label>
            <label>
              <span>Phone</span>
              <input defaultValue={customer.phone} />
            </label>
            <label>
              <span>Priority</span>
              <select defaultValue={customer.priority}>
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
              </select>
            </label>
            <label>
              <span>Devices</span>
              <input defaultValue={customer.devices} />
            </label>
            <label>
              <span>Status</span>
              <input defaultValue={customer.status} />
            </label>
            <label className="full">
              <span>Notes</span>
              <textarea defaultValue={customer.notes} rows={6} />
            </label>
            <section className="quick-actions full">
              <Link className="quick" href="/admin/jobs/new">+ Job<small>Create support or repair work</small></Link>
              <Link className="quick" href="/admin/quotes/new">+ Quote<small>Prepare an estimate</small></Link>
              <Link className="quick" href="/admin/requests">Support requests<small>Review recent enquiries</small></Link>
              <Link className="quick" href={`mailto:${customer.email}`}>Email<small>Contact customer</small></Link>
            </section>
            <div className="form-actions">
              <Link className="button button-ghost" href="/admin/customers">Cancel</Link>
              <Link className="button" href="/admin/customers">Save customer</Link>
            </div>
          </form>
        </div>
      </>
    );
  }

  if (section === "jobs") {
    const job = jobs.find((entry) => entry.reference === reference);
    if (!job) notFound();

    return (
      <>
        <header className="admin-topbar">
          <div>
            <h1>Open {job.reference}</h1>
            <small>{job.customer} - {job.issue}</small>
          </div>
          <Link className="admin-action secondary" href="/admin/jobs">Back to jobs</Link>
        </header>
        <div className="admin-content">
          <form className="admin-form quote-form">
            <label>
              <span>Job reference</span>
              <input defaultValue={job.reference} />
            </label>
            <label>
              <span>Status</span>
              <select defaultValue={job.status}>
                <option>New</option>
                <option>In progress</option>
                <option>Waiting parts</option>
                <option>Quote sent</option>
                <option>Ready</option>
                <option>Completed</option>
              </select>
            </label>
            <label>
              <span>Customer</span>
              <select defaultValue={job.customer}>
                {customers.map((customer) => <option key={customer.id} value={customer.name}>{customer.name} - {customer.type}</option>)}
              </select>
            </label>
            <label>
              <span>Device</span>
              <input defaultValue={job.device} />
            </label>
            <label>
              <span>Priority</span>
              <select defaultValue={job.priority}>
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
              </select>
            </label>
            <label>
              <span>Service type</span>
              <select defaultValue={job.serviceType}>
                <option>Remote support</option>
                <option>Workshop repair</option>
                <option>Business onsite</option>
                <option>Equipment setup</option>
              </select>
            </label>
            <label>
              <span>Owner</span>
              <input defaultValue={job.owner} />
            </label>
            <label>
              <span>Due</span>
              <input defaultValue={job.dueAt} />
            </label>
            <label className="full">
              <span>Issue</span>
              <textarea defaultValue={job.issue} rows={4} />
            </label>
            <label className="full">
              <span>Technician notes</span>
              <textarea defaultValue="Diagnosis, customer updates, parts required, and resolution notes." rows={6} />
            </label>
            <section className="quick-actions full">
              <Link className="quick" href="/admin/quotes/new">+ Quote<small>Create quote for this job</small></Link>
              <Link className="quick" href="/admin/inventory">Check parts<small>Search stock and equipment</small></Link>
              <Link className="quick" href="/admin/requests">Customer reply<small>Use templates and WhatsApp</small></Link>
              <Link className="quick" href="/admin/jobs">Complete job<small>Return to job queue</small></Link>
            </section>
            <div className="form-actions">
              <Link className="button button-ghost" href="/admin/jobs">Cancel</Link>
              <Link className="button" href="/admin/jobs">Save job</Link>
            </div>
          </form>
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
