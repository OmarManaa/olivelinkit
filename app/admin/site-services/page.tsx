import { WebsiteServicesEditor } from "../website-services-editor";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SiteServicesPage() {
  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Website Services</h1>
          <small>Edit the public service cards, icons, and request form mapping</small>
        </div>
        <Link className="admin-action secondary" href="/admin/service-pricing">Edit pricing</Link>
      </header>
      <div className="admin-content"><WebsiteServicesEditor /></div>
    </>
  );
}
