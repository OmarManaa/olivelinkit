"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { businessContact, supportEmailHref, whatsappHref } from "./contact-config";
import { BrandLogo } from "./brand-logo";
import type { InventoryItem } from "./admin/admin-data";
import { EquipmentCards } from "./equipment-cards";
import { PricingSection } from "./pricing-section";
import { ServiceCards } from "./service-cards";
import { SupportAssistant } from "./support-assistant";
import { defaultWebsiteContent, type WebsiteContent } from "./website-content-data";
import { defaultWebsitePricing, type WebsitePricingContent } from "./website-pricing-data";
import { readWebsiteContent } from "./website-content-store";
import type { WebsiteService } from "./website-services-data";

type HomePageClientProps = {
  initialContent?: WebsiteContent;
  initialServices?: WebsiteService[];
  initialPricing?: WebsitePricingContent;
  initialEquipment?: InventoryItem[];
};

function structuredBusinessData(content: WebsiteContent) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: content.businessLegalName || content.brandTitle,
    description: content.heroLead,
    email: content.contactEmail,
    areaServed: content.locationText,
    ...(content.businessPhone ? { telephone: content.businessPhone } : {}),
    ...(content.businessAbn ? { taxID: content.businessAbn } : {}),
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

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

export function HomePageClient({ initialContent = defaultWebsiteContent, initialServices, initialPricing = defaultWebsitePricing, initialEquipment }: HomePageClientProps) {
  const [content, setContent] = useState<WebsiteContent>(initialContent);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setContent(readWebsiteContent());
    window.addEventListener("website-content-updated", refresh);
    return () => window.removeEventListener("website-content-updated", refresh);
  }, []);

  const contactWhatsApp = whatsappHref("Hi, I need help with IT support.", content.whatsappNumber);
  const consultingHref = `/?${new URLSearchParams({ requestType: "Business IT", service: "IT planning and technology advice" }).toString()}#support-assistant`;
  const popularServices = (initialServices ?? []).slice(0, 3);

  return (
    <main className="public-site" id="main-content" style={themeStyle(content)}>
      <a className="skip-link" href="#services">Skip to services</a>
      <script dangerouslySetInnerHTML={{ __html: structuredBusinessData(content) }} type="application/ld+json" />
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
          <a href="#services">Services</a>
          <a href="/web-design">Website design</a>
          <a href="/pricing">Pricing</a>
          <a href="#who-we-help">Who we help</a>
          <a href="#equipment">Equipment</a>
          <a href="#about">Why us</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="button button-small header-button" href="#support-assistant">
          {content.headerCta}
        </a>
        <button
          aria-controls="mobile-site-navigation"
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
        <nav className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`} id="mobile-site-navigation" aria-label="Mobile navigation">
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="/web-design" onClick={() => setMobileMenuOpen(false)}>Website design</a>
          <a href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a href="#who-we-help" onClick={() => setMobileMenuOpen(false)}>Who we help</a>
          <a href="#equipment" onClick={() => setMobileMenuOpen(false)}>Equipment</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>Why us</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          <div className="mobile-nav-group">
            <span>Popular services</span>
            {popularServices.map((service) => {
              const href = `/?${new URLSearchParams({ requestType: service.requestType, service: service.title }).toString()}#support-assistant`;
              return (
                <a key={service.id} href={href} onClick={() => setMobileMenuOpen(false)}>
                  {service.title}
                </a>
              );
            })}
            <a className="button button-ghost" href="#services" onClick={() => setMobileMenuOpen(false)}>
              See all services
            </a>
          </div>
          <a className="button" href="#support-assistant" onClick={() => setMobileMenuOpen(false)}>Request IT help</a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">{content.heroEyebrow}</p>
          <h1 id="hero-title">
            {content.heroTitle}
            <br />
            <span>{content.heroAccent}</span>
          </h1>
          <p className="hero-lead">{content.heroLead}</p>
          <div className="hero-actions">
            <a className="button" href="#support-assistant">
              {content.heroPrimaryCta}
              <span aria-hidden="true">-&gt;</span>
            </a>
            <a className="button button-ghost" href="#services">
              {content.heroSecondaryCta}
            </a>
          </div>
          <div className="hero-facts" aria-label="Service details">
            <span>{content.locationText}</span>
            <span>{content.businessHours}</span>
            <span>{content.responseExpectation}</span>
          </div>
          <div className="trust-row" aria-label="Trust signals">
            {content.trustItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="hero-showcase" aria-label="Service overview">
          <div className="hero-photo">
            <picture>
              <img
                src={content.heroImageUrl || "/hero-it-support.webp"}
                alt="Technician configuring small business network equipment beside a laptop"
                fetchPriority="high"
                height={900}
                loading="eager"
                decoding="async"
                width={1600}
              />
            </picture>
            <div className="hero-photo-badge">
              <span className="live-dot" />
              Remote and onsite ready
            </div>
          </div>
          <div className="hero-panel">
            <div className="panel-top">
              <span className="live-dot" />
              {content.processLabel}
            </div>
            {content.processSteps.map((step) => (
              <div className="support-option" key={step.number}>
                <b>{step.number}</b>
                <div>
                  <strong>{step.title}</strong>
                  <small>{step.text}</small>
                </div>
              </div>
            ))}
            <div className="experience-card">
              <strong>{content.experienceValue}</strong>
              <span>{content.experienceLabel}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{content.servicesEyebrow}</p>
            <h2>{content.servicesTitle}</h2>
          </div>
          <p>{content.servicesText}</p>
        </div>
        <div className="service-expectations" aria-label="What to expect">
          <p>What you can expect</p>
          <div>
            {content.serviceHighlights.map((highlight) => (
              <article key={highlight.title}>
                <strong>{highlight.title}</strong>
                <span>{highlight.text}</span>
              </article>
            ))}
          </div>
        </div>
        <ServiceCards initialServices={initialServices} />
      </section>

      <PricingSection initialPricing={initialPricing} mode="home" />

      <section className="audience-section" id="who-we-help">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{content.audienceEyebrow}</p>
            <h2>{content.audienceTitle}</h2>
          </div>
          <p>{content.audienceText}</p>
        </div>
        <div className="audience-grid">
          {content.audienceItems.map((audience, index) => (
            <article className="audience-item" key={audience.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{audience.title}</h3>
              <p>{audience.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="consulting-section">
        <div>
          <p className="eyebrow">{content.consultingEyebrow}</p>
          <h2>{content.consultingTitle}</h2>
          <p>{content.consultingText}</p>
        </div>
        <a className="button" href={consultingHref}>{content.consultingCta}<span aria-hidden="true">-&gt;</span></a>
      </section>

      {content.testimonials.length > 0 && (
        <section className="testimonials-section" aria-labelledby="testimonials-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{content.testimonialEyebrow}</p>
              <h2 id="testimonials-title">{content.testimonialTitle}</h2>
            </div>
            <p>{content.testimonialText}</p>
          </div>
          <div className="testimonial-grid">
            {content.testimonials.map((testimonial, index) => (
              <figure className="testimonial" key={`${testimonial.name}-${index}`}>
                <blockquote>{testimonial.quote}</blockquote>
                <figcaption><strong>{testimonial.name}</strong><span>{testimonial.context}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <SupportAssistant initialContent={initialContent} initialInventory={initialEquipment} />

      <section className="dark-section" id="about">
        <div>
          <p className="eyebrow light">{content.aboutEyebrow}</p>
          <h2>{content.aboutTitle}</h2>
          <p>{content.aboutText}</p>
          <div className="about-proof">
            <div>
              <strong>{content.experienceValue}</strong>
              <span>{content.experienceLabel}</span>
            </div>
            <div>
              <strong>{content.aboutAudienceTitle}</strong>
              <span>{content.aboutAudienceText}</span>
            </div>
          </div>
        </div>
        <div className="skill-list">{content.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
      </section>

      <section className="section" id="equipment">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{content.equipmentEyebrow}</p>
            <h2>{content.equipmentTitle}</h2>
          </div>
          <p>{content.equipmentText}</p>
        </div>
        <EquipmentCards initialItems={initialEquipment} />
      </section>

      <section className="contact-section" id="contact">
        <div>
          <p className="eyebrow">{content.contactEyebrow}</p>
          <h2>{content.contactTitle}</h2>
          <p>{content.contactText}</p>
        </div>
        <div className="contact-actions">
          <a className="button button-light" href={supportEmailHref("IT Support Request", "", content.contactEmail)}>
            {content.contactButton}
          </a>
          {contactWhatsApp && <a className="button button-ghost" href={contactWhatsApp}>WhatsApp quick message</a>}
          <span>{content.locationText || `${businessContact.location} - By arrangement`}</span>
        </div>
      </section>

      <a className="mobile-sticky-cta" href="#support-assistant">Request IT help</a>
      <footer>
        <span>{content.footerText}{content.businessAbn ? ` | ABN ${content.businessAbn}` : ""}</span>
        <Link href="/privacy">Privacy</Link>
      </footer>
    </main>
  );
}
