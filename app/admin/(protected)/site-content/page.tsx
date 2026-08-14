import { WebsiteContentEditor } from "../../website-content-editor";

export const dynamic = "force-dynamic";

export default function SiteContentPage() {
  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Website Content</h1>
          <small>Manage public copy, calls to action, contact details, and invoice settings</small>
        </div>
      </header>
      <div className="admin-content"><WebsiteContentEditor /></div>
    </>
  );
}
