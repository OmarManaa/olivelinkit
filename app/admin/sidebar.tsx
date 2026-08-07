"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const workspaceLinks = [
  ["Dashboard", "/admin"],
  ["Support Requests", "/admin/requests"],
  ["Jobs & Repairs", "/admin/jobs"],
  ["Customers", "/admin/customers"],
  ["Quotes", "/admin/quotes"],
  ["Inventory", "/admin/inventory"],
  ["Equipment Sales", "/admin/equipment"],
  ["Follow-ups", "/admin/followups"],
  ["Reports", "/admin/reports"],
];

type SidebarProps = {
  adminEmail: string;
};

export function Sidebar({ adminEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">IT</span>
        <span>
          <strong>IT Services</strong>
          <small>BUSINESS CONSOLE</small>
        </span>
      </div>
      <p className="nav-label">WORKSPACE</p>
      <nav className="side-nav" aria-label="Admin workspace">
        {workspaceLinks.map(([label, href]) => {
          const isActive = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link aria-current={isActive ? "page" : undefined} className={isActive ? "active" : ""} href={href} key={href}>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <p className="nav-label">WEBSITE</p>
      <nav className="side-nav" aria-label="Public website">
        <Link aria-current={pathname.startsWith("/admin/site-content") ? "page" : undefined} className={pathname.startsWith("/admin/site-content") ? "active" : ""} href="/admin/site-content">
          <span>Website Content</span>
        </Link>
        <Link aria-current={pathname.startsWith("/admin/site-services") ? "page" : undefined} className={pathname.startsWith("/admin/site-services") ? "active" : ""} href="/admin/site-services">
          <span>Website Services</span>
        </Link>
        <Link aria-current={pathname.startsWith("/admin/backup") ? "page" : undefined} className={pathname.startsWith("/admin/backup") ? "active" : ""} href="/admin/backup">
          <span>Backup & Restore</span>
        </Link>
        <Link href="/">
          <span>View public site</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <div className="admin-user">Administrator<br />{adminEmail}</div>
      </div>
    </aside>
  );
}
