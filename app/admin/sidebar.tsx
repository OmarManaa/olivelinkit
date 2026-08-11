"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "../brand-logo";

const workspaceLinks = [
  ["Dashboard", "/admin"],
  ["Support Requests", "/admin/requests"],
  ["Jobs & Repairs", "/admin/jobs"],
  ["Customers", "/admin/customers"],
  ["Quotes", "/admin/quotes"],
  ["Invoices", "/admin/invoices"],
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      <button
        aria-controls="admin-navigation"
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? "Close admin navigation" : "Open admin navigation"}
        className="admin-mobile-toggle"
        onClick={() => setMobileOpen((open) => !open)}
        title={mobileOpen ? "Close navigation" : "Open navigation"}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>
      {mobileOpen && <button aria-label="Close admin navigation" className="admin-mobile-backdrop" onClick={closeMobileMenu} type="button" />}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`} id="admin-navigation">
      <div className="sidebar-brand">
        <BrandLogo />
        <span>
          <strong>OliveLink IT</strong>
          <small>BUSINESS CONSOLE</small>
        </span>
      </div>
      <p className="nav-label">WORKSPACE</p>
      <nav className="side-nav" aria-label="Admin workspace">
        {workspaceLinks.map(([label, href]) => {
          const isActive = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link aria-current={isActive ? "page" : undefined} className={isActive ? "active" : ""} href={href} key={href} onClick={closeMobileMenu}>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <p className="nav-label">WEBSITE</p>
      <nav className="side-nav" aria-label="Public website">
        <Link aria-current={pathname.startsWith("/admin/site-content") ? "page" : undefined} className={pathname.startsWith("/admin/site-content") ? "active" : ""} href="/admin/site-content" onClick={closeMobileMenu}>
          <span>Website Content</span>
        </Link>
        <Link aria-current={pathname.startsWith("/admin/site-services") ? "page" : undefined} className={pathname.startsWith("/admin/site-services") ? "active" : ""} href="/admin/site-services" onClick={closeMobileMenu}>
          <span>Website Services</span>
        </Link>
        <Link aria-current={pathname.startsWith("/admin/service-pricing") ? "page" : undefined} className={pathname.startsWith("/admin/service-pricing") ? "active" : ""} href="/admin/service-pricing" onClick={closeMobileMenu}>
          <span>Service Pricing</span>
        </Link>
        <Link aria-current={pathname.startsWith("/admin/backup") ? "page" : undefined} className={pathname.startsWith("/admin/backup") ? "active" : ""} href="/admin/backup" onClick={closeMobileMenu}>
          <span>Backup & Restore</span>
        </Link>
        <Link href="/" onClick={closeMobileMenu}>
          <span>View public site</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <div className="admin-user">Administrator<br />{adminEmail}</div>
      </div>
      </aside>
    </>
  );
}
