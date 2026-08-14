import { WebsitePortfolioEditor } from "../../website-portfolio-editor";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SitePortfolioPage() {
  return (
    <>
      <header className="admin-topbar">
        <div>
          <h1>Website Portfolio</h1>
          <small>Manage featured web design examples shown on the public web design page</small>
        </div>
        <Link className="admin-action secondary" href="/admin/site-content">Edit homepage content</Link>
      </header>
      <div className="admin-content"><WebsitePortfolioEditor /></div>
    </>
  );
}
