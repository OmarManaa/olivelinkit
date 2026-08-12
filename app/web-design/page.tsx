import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedSiteData } from "../site-data-server";
import { ServiceCards } from "../service-cards";

export const metadata: Metadata = {
  title: "Web Design & Website Support | OliveLink IT",
  description: "Website design, business website support, and web presence services for Melbourne small businesses.",
};

export default async function WebDesignPage() {
  const siteData = await getPublishedSiteData();
  return (
    <main className="public-site">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Return to OliveLink IT home">
          <strong>OliveLink IT</strong>
          <small>WEB DESIGN</small>
        </Link>
        <Link className="button button-ghost button-small" href="/">Back to website</Link>
      </header>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">WEB DESIGN SERVICES</p>
            <h1>Website design and practical website support for Melbourne businesses</h1>
          </div>
          <p>Design, update, and maintain your small business website with straightforward guidance and reliable technical support.</p>
        </div>
        <div className="section-copy">
          <p>We build sensible websites and help local businesses keep their online presence working well. Whether you need a fresh site, better SEO, or ongoing web maintenance, we focus on clarity, performance, and real business results.</p>
        </div>
        <div className="service-grid">
          <article className="service-card">
            <div className="service-card-top">
              <span className="service-icon">🌐</span>
              <span className="service-index">01</span>
            </div>
            <h3>Website design and refresh</h3>
            <p>Professional small-business websites with clear messaging, responsive layouts, and fast loading for customer trust.</p>
          </article>
          <article className="service-card">
            <div className="service-card-top">
              <span className="service-icon">🛠️</span>
              <span className="service-index">02</span>
            </div>
            <h3>Website updates and support</h3>
            <p>Ongoing updates, content changes, security checks, and performance tuning so your site stays useful and current.</p>
          </article>
          <article className="service-card">
            <div className="service-card-top">
              <span className="service-icon">🔍</span>
              <span className="service-index">03</span>
            </div>
            <h3>Website visibility help</h3>
            <p>Search-friendly site structure, clear service pages, and business listing support for customers to find you online.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">RELATED SERVICES</p>
            <h2>Complete IT support around your website</h2>
          </div>
          <p>We pair website help with practical IT support, data recovery, backups, and network services for Australian small businesses.</p>
        </div>
        <ServiceCards initialServices={siteData.services} />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">READY TO START?</p>
            <h2>Let us help you build or refresh your business website</h2>
          </div>
          <p>Reach out for a quick quote, website needs review, or design discussion backed by local IT support experience.</p>
        </div>
        <div className="page-actions">
          <Link className="button" href="/contact">Contact</Link>
          <Link className="button button-ghost" href="/pricing">Pricing</Link>
        </div>
      </section>
    </main>
  );
}
