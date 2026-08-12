import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../brand-logo";
import { businessContact, supportEmailHref, whatsappHref } from "../contact-config";

export const metadata: Metadata = {
  title: "Contact OliveLink IT",
  description: "Contact OliveLink IT for Melbourne IT support, computer repairs, business IT services, and technology advice.",
};

export default function ContactPage() {
  const whatsappMessage = "Hi, I need help with IT support or technology advice.";
  const whatsappLink = whatsappHref(whatsappMessage, businessContact.whatsappNumber);

  return (
    <main className="policy-page">
      <header className="policy-header">
        <Link className="brand" href="/" aria-label="Return to OliveLink IT home">
          <BrandLogo />
          <span><strong>OliveLink IT</strong><small>CONTACT</small></span>
        </Link>
        <Link className="button button-ghost button-small" href="/">Back to website</Link>
      </header>
      <article className="policy-content">
        <p className="eyebrow">CONTACT</p>
        <h1>Contact OliveLink IT in Melbourne</h1>
        <p>Get in touch for IT support, managed IT services, networking, website advice, and data recovery.</p>
        <section>
          <h2>Talk to us</h2>
          <p>Email: <a href={supportEmailHref("IT Support Request")}>{businessContact.email}</a></p>
          {whatsappLink && <p>WhatsApp: <a href={whatsappLink}>{businessContact.whatsappNumber}</a></p>}
          <p>Service area: Melbourne, Victoria</p>
        </section>
        <section>
          <h2>Need help with</h2>
          <ul>
            <li>Business IT support</li>
            <li>Computer repairs and fault diagnosis</li>
            <li>Data recovery and backup recovery</li>
            <li>Website help, updates, and small-business web presence</li>
            <li>Managed IT and network support</li>
          </ul>
        </section>
        <section>
          <h2>Quick access</h2>
          <p>Learn more about the services we offer on the <Link href="/services">Services</Link> page or review our <Link href="/pricing">Pricing</Link>.</p>
        </section>
      </article>
    </main>
  );
}
