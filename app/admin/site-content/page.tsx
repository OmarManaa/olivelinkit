import { WebsiteContentEditor } from "../website-content-editor";

export const dynamic = "force-dynamic";

export default function SiteContentPage() {
  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Website Content</h1>
          <small>Edit public homepage copy, CTAs, trust messages, and section headings</small>
        </div>
      </header>
      <div className="admin-content"><WebsiteContentEditor /></div>
    </>
  );
}
