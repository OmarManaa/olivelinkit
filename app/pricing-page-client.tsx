"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { BrandLogo } from "./brand-logo";
import { PricingSection } from "./pricing-section";
import { defaultWebsiteContent, type WebsiteContent } from "./website-content-data";
import { readWebsiteContent } from "./website-content-store";
import { defaultWebsitePricing, type WebsitePricingContent } from "./website-pricing-data";

type PricingPageClientProps = {
  initialContent?: WebsiteContent;
  initialPricing?: WebsitePricingContent;
};

function themeStyle(content: WebsiteContent) {
  const theme = content.theme ?? defaultWebsiteContent.theme;
  return {
    "--blue": theme.primaryColor,
    "--teal": theme.secondaryColor,
    "--navy": theme.darkColor,
    "--amber": theme.accentColor,
    "--green": theme.successColor,
  } as CSSProperties;
}

export function PricingPageClient({ initialContent = defaultWebsiteContent, initialPricing = defaultWebsitePricing }: PricingPageClientProps) {
  const [content, setContent] = useState<WebsiteContent>(initialContent);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setContent(readWebsiteContent());
    window.addEventListener("website-content-updated", refresh);
    return () => window.removeEventListener("website-content-updated", refresh);
  }, []);

  return (
    <main className="public-site pricing-page" id="main-content" style={themeStyle(content)}>
      <a className="skip-link" href="#pricing">Skip to pricing</a>
      <header className="site-header">
        <Link className={`brand ${content.showBrandText ? "" : "brand-logo-only"}`.trim()} href="/" aria-label={`${content.brandTitle} home`}>
          <BrandLogo alt={content.logoAlt} src={content.logoUrl} />
          {content.showBrandText && (
            <span>
              <strong>{content.brandTitle}</strong>
              <small>{content.brandSubtitle}</small>
            </span>
          )}
        </Link>
        <nav className="public-nav" aria-label="Main navigation">
          <Link href="/#services">Services</Link>
          <Link aria-current="page" href="/pricing">Pricing</Link>
          <Link href="/#who-we-help">Who we help</Link>
          <Link href="/#equipment">Equipment</Link>
          <Link href="/#about">Why us</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
        <Link className="button button-small header-button" href="/#support-assistant">
          {content.headerCta}
        </Link>
        <button
          aria-controls="mobile-pricing-navigation"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          title={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`} id="mobile-pricing-navigation" aria-label="Mobile navigation">
          <Link href="/#services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
          <Link aria-current="page" href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          <Link href="/#who-we-help" onClick={() => setMobileMenuOpen(false)}>Who we help</Link>
          <Link href="/#equipment" onClick={() => setMobileMenuOpen(false)}>Equipment</Link>
          <Link href="/#about" onClick={() => setMobileMenuOpen(false)}>Why us</Link>
          <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <Link className="button" href="/#support-assistant" onClick={() => setMobileMenuOpen(false)}>Request IT help</Link>
        </nav>
      </header>

      <PricingSection headingLevel="h1" initialPricing={initialPricing} mode="full" />

      <section className="pricing-page-cta">
        <div>
          <p className="eyebrow">NOT SURE WHAT FITS?</p>
          <h2>Send the symptoms and we will recommend the sensible next step.</h2>
        </div>
        <Link className="button" href="/#support-assistant">Request IT help<span aria-hidden="true">-&gt;</span></Link>
      </section>

      <footer>
        <span>{content.footerText}{content.businessAbn ? ` | ABN ${content.businessAbn}` : ""}</span>
        <Link href="/privacy">Privacy</Link>
      </footer>
    </main>
  );
}
