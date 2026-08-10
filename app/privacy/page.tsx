import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../brand-logo";
import { businessContact } from "../contact-config";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How OliveLink IT uses enquiry details.",
};

export default function PrivacyPage() {
  return (
    <main className="policy-page">
      <header className="policy-header">
        <Link className="brand" href="/" aria-label="Return to OliveLink IT home">
          <BrandLogo />
          <span><strong>OliveLink IT</strong><small>PRIVACY</small></span>
        </Link>
        <Link className="button button-ghost button-small" href="/">Back to website</Link>
      </header>
      <article className="policy-content">
        <p className="eyebrow">PRIVACY</p>
        <h1>Privacy for support enquiries.</h1>
        <p className="policy-lead">When you contact us, we use the details you provide to understand the request, reply to you, and arrange approved IT work.</p>
        <section>
          <h2>What we collect</h2>
          <p>Your name, preferred contact details, the information you include about your device or business, and any item or service you ask about.</p>
        </section>
        <section>
          <h2>How we use it</h2>
          <p>We use enquiry details to respond, prepare a quote when requested, provide support, maintain agreed service records, and follow up about work you have asked us to perform.</p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>For a privacy question or to update your details, contact <a href={`mailto:${businessContact.email}`}>{businessContact.email}</a>.</p>
        </section>
        <p className="policy-note">This page should be reviewed against your final business practices and legal obligations before public launch.</p>
      </article>
    </main>
  );
}
