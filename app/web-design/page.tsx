import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedSiteData } from "../site-data-server";
import WebDesignCallout from "./web-design-callout";

export const metadata: Metadata = {
  title: "Web Design & Website Support | OliveLink IT Solutions",
  description: "Website design, business website support, and web presence services for Melbourne small businesses, including wet cupping and health practice websites.",
};

export default async function WebDesignPage() {
  const siteData = await getPublishedSiteData();
  return (
    <main className="public-site">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Return to OliveLink IT Solutions home">
          <strong>OliveLink IT Solutions</strong>
          <small>WEB DESIGN</small>
        </Link>
        <Link className="button button-ghost button-small" href="/">Back to website</Link>
      </header>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{siteData.content.webDesignEyebrow}</p>
            <h1>{siteData.content.webDesignHeading}</h1>
          </div>
          <p>{siteData.content.webDesignLead}</p>
        </div>
        <div className="section-copy">
          <p>{siteData.content.webDesignServiceDescription}</p>
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
            <p className="eyebrow">{siteData.content.webDesignFeatureEyebrow}</p>
            <h2>{siteData.content.webDesignFeatureHeading}</h2>
          </div>
        </div>

        <WebDesignCallout text={siteData.content.webDesignCallout ?? siteData.content.webDesignFeatureDescription} />
        <div className="case-study-grid">
          {siteData.portfolio.map((item) => (
            <article className="case-study-card" key={item.id}>
              {item.imageUrl ? (
                <div className="case-study-image">
                  <img src={item.imageUrl} alt={`Screenshot of ${item.title}`} />
                </div>
              ) : null}
              <div className="case-study-details">
                <h3>{item.title}</h3>
                <p>Live website example: <a href={item.url} target="_blank" rel="noreferrer">{item.url.replace(/^https?:\/\//, "")}</a></p>
                <p>{item.description}</p>
              </div>
              <div className="case-study-links">
                <a className="button" href={item.url} target="_blank" rel="noreferrer">{item.button}</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">READY TO START?</p>
            <h2>{siteData.content.webDesignCTAHeading}</h2>
          </div>
          <p>{siteData.content.webDesignCTAText}</p>
        </div>
        <div className="page-actions">
          <Link className="button" href="/contact">Contact</Link>
          <Link className="button button-ghost" href="/pricing">Pricing</Link>
        </div>
      </section>
    </main>
  );
}
