import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedSiteData } from "../site-data-server";
import { ServiceCards } from "../service-cards";

export const metadata: Metadata = {
  title: "OliveLink IT Solutions Services",
  description: "Explore IT support, website design, network services, computer repairs, and data recovery services in Melbourne.",
};

export default async function ServicesPage() {
  const siteData = await getPublishedSiteData();
  return (
    <main className="public-site">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Return to OliveLink IT Solutions home">
          <strong>OliveLink IT Solutions</strong>
          <small>SERVICES</small>
        </Link>
        <Link className="button button-ghost button-small" href="/">Back to website</Link>
      </header>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OUR SERVICES</p>
            <h1>IT support, equipment, web help and data recovery</h1>
          </div>
          <p>Browse our current service offerings, then ask about the service you need using the contact options below.</p>
        </div>
        <div className="section-copy">
          <p>We support small businesses, not-for-profits and local professionals across Melbourne with practical IT services, website design, repairs, and technology planning.</p>
        </div>
        <ServiceCards initialServices={siteData.services} />
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MORE HELP</p>
            <h2>Want pricing or immediate contact?</h2>
          </div>
          <p>Visit our pricing page for service costs and then get in touch to request a quote.</p>
        </div>
        <div className="page-actions">
          <Link className="button" href="/pricing">Pricing</Link>
          <Link className="button button-ghost" href="/contact">Contact</Link>
        </div>
      </section>
    </main>
  );
}
