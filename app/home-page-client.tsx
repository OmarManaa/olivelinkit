"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { businessContact, supportEmailHref, whatsappHref } from "./contact-config";
import { EquipmentCards } from "./equipment-cards";
import { ServiceCards } from "./service-cards";
import { SupportAssistant } from "./support-assistant";
import { defaultWebsiteContent, type WebsiteContent } from "./website-content-data";
import { readWebsiteContent } from "./website-content-store";

export function HomePageClient() {
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent);

  useEffect(() => {
    const refresh = () => setContent(readWebsiteContent());
    refresh();
    window.addEventListener("website-content-updated", refresh);
    return () => window.removeEventListener("website-content-updated", refresh);
  }, []);

  const contactWhatsApp = whatsappHref("Hi, I need help with IT support.", content.whatsappNumber);

  return (
    <main className="public-site">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="IT Services home">
          <span className="brand-mark">IT</span>
          <span>
            <strong>{content.brandTitle}</strong>
            <small>{content.brandSubtitle}</small>
          </span>
        </Link>
        <nav className="public-nav" aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#equipment">Equipment</a>
          <a href="#about">Why us</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="button button-small header-button" href="#support-assistant">
          {content.headerCta}
        </a>
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
          <div className="trust-row" aria-label="Trust signals">
            {content.trustItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="hero-showcase" aria-label="Service overview">
          <div className="hero-photo">
            <picture>
              <source srcSet="/hero-it-support.webp" type="image/webp" />
              <img
                src="/hero-it-support.png"
                alt="Technician configuring small business network equipment beside a laptop"
                loading="eager"
                decoding="async"
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

      <section className="signal-strip" aria-label="Service highlights">
        <div>
          <strong>Fast first response</strong>
          <span>Clear triage before time is wasted.</span>
        </div>
        <div>
          <strong>Plain-English advice</strong>
          <span>Options, priority and cost explained up front.</span>
        </div>
        <div>
          <strong>Business-grade care</strong>
          <span>Backups, security and reliability considered together.</span>
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
        <ServiceCards />
      </section>

      <SupportAssistant />

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
              <strong>Home + SMB</strong>
              <span>Support scaled to the way you actually work.</span>
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
        <EquipmentCards />
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

      <footer><span>{content.footerText}</span><Link href="/admin">Admin</Link></footer>
    </main>
  );
}
