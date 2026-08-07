import { WebsiteServicesEditor } from "../website-services-editor";

export const dynamic = "force-dynamic";

export default function SiteServicesPage() {
  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Website Services</h1>
          <small>Edit the public service cards, icons, and request form mapping</small>
        </div>
      </header>
      <div className="admin-content"><WebsiteServicesEditor /></div>
    </>
  );
}
