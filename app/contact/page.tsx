import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../brand-logo";
import { businessContact, phoneHref, supportEmailHref, whatsappHref } from "../contact-config";

export const metadata: Metadata = {
  title: "Contact OliveLink IT Solutions | Melbourne IT Support & Website Design",
  description: "Practical computer repairs, networking, business IT, website design, and data recovery services for Melbourne small businesses. Contact us today.",
  keywords: "IT support Melbourne, computer repairs Melbourne, business IT services, website design Melbourne, data recovery Melbourne, managed IT services",
  openGraph: {
    title: "Contact OliveLink IT Solutions | Melbourne IT Support & Website Design",
    description: "Practical computer repairs, networking, business IT, website design, and data recovery for Melbourne small businesses.",
    url: "https://olivelinkit.au/contact",
    siteName: "OliveLink IT Solutions",
    type: "website",
  },
};

export default function ContactPage() {
  const whatsappMessage = "Hi, I need help with IT support or technology advice.";
  const whatsappLink = whatsappHref(whatsappMessage, businessContact.whatsappNumber);
  const fullAddress = businessContact.location; // Now pulls from config
  const googleMapsUrl = "https://maps.google.com/?q=Doncaster+East+Melbourne+VIC+3109";

  // Schema markup for local business SEO
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "OliveLink IT Solutions",
    "description": "Practical computer repairs, networking, business IT, website design, and data recovery services for Melbourne small businesses.",
    "image": "https://olivelinkit.au/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": businessContact.address.street,
      "addressLocality": businessContact.address.city,
      "addressRegion": businessContact.address.state,
      "postalCode": businessContact.address.postcode,
      "addressCountry": businessContact.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-37.7886",
      "longitude": "145.1524"
    },
    "telephone": businessContact.phone,
    "email": businessContact.email,
    "priceRange": "$$",
    "openingHours": "Mo-Fr 09:00-17:00",
    "url": "https://olivelinkit.au/contact",
    "sameAs": [
      "https://facebook.com/olivelinkit",
      "https://linkedin.com/company/olivelinkit"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "IT Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Computer Repairs",
            "description": "Professional computer repair and fault diagnosis"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Business IT Support",
            "description": "Managed IT services for Melbourne small businesses"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Website Design",
            "description": "Small business website design and development"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Data Recovery",
            "description": "Professional data recovery and backup solutions"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Networking",
            "description": "Business networking and network support"
          }
        }
      ]
    }
  };

  return (
    <>
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <main className="policy-page">
        <header className="policy-header">
          <Link className="brand" href="/" aria-label="Return to OliveLink IT Solutions home">
            <BrandLogo />
            <span><strong>OliveLink IT Solutions</strong><small>CONTACT</small></span>
          </Link>
          <Link className="button button-ghost button-small" href="/">Back to website</Link>
        </header>

        <article className="policy-content">
          <p className="eyebrow">CONTACT</p>
          <h1>Contact OliveLink IT Solutions | Melbourne IT Support & Website Design</h1>
          <p>Practical computer repairs, networking, business IT, website design, and data recovery services for Melbourne small businesses.</p>

          <section>
            <h2>Get in Touch</h2>

            {/* Address - Full & Clear */}
            <address style={{ fontStyle: 'normal', marginBottom: '1rem' }}>
              <strong>📍 OliveLink IT Solutions</strong><br />
              {businessContact.address.street}<br />
              {businessContact.address.city}, {businessContact.address.state} {businessContact.address.postcode}<br />
              {businessContact.address.country}
            </address>

            {/* Google Maps Link */}
            <p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get directions to OliveLink IT Solutions on Google Maps"
              >
                🗺️ Get directions on Google Maps
              </a>
            </p>

            {/* Contact Methods */}
            <p>📧 Email: <a href={supportEmailHref("IT Support Request")}>{businessContact.email}</a></p>
            {businessContact.phone && (
              <p>📞 Phone: <a href={phoneHref(businessContact.phone)}>{businessContact.phone}</a></p>
            )}
            {whatsappLink && (
              <p>💬 WhatsApp: <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                {businessContact.whatsappNumber}
              </a></p>
            )}

            {/* Hours */}
            <p>🕐 Business Hours: <strong>Monday - Friday, 9:00 AM - 5:00 PM</strong></p>

            {/* Service Area */}
            <p>📍 Service Area: <strong>{fullAddress}</strong> and surrounding suburbs</p>
          </section>

          <hr style={{ margin: '2rem 0' }} />

          <section>
            <h2>Our IT Services for Melbourne Businesses</h2>
            <ul>
              <li>💻 <strong>Business IT Support</strong> - Managed IT services and consulting</li>
              <li>🖥️ <strong>Computer Repairs</strong> - Professional fault diagnosis and repair</li>
              <li>💾 <strong>Data Recovery</strong> - Reliable data recovery and backup solutions</li>
              <li>🌐 <strong>Website Design</strong> - Small business websites and digital presence</li>
              <li>🔒 <strong>Networking</strong> - Business networking and network support</li>
              <li>☁️ <strong>Cloud Services</strong> - Migration and cloud management</li>
            </ul>
          </section>

          <section>
            <h2>Quick access</h2>
            <p>Learn more about the services we offer on the <Link href="/services">Services</Link> page or review our <Link href="/pricing">Pricing</Link>.</p>
          </section>

          {/* CTA Section */}
          <section style={{
            background: '#f5f5f5',
            padding: '2rem',
            borderRadius: '8px',
            marginTop: '2rem',
            textAlign: 'center'
          }}>
            <h2>Need IT Support in Melbourne?</h2>
            <p style={{ marginBottom: '1rem' }}>
              We provide practical IT solutions for small businesses in Doncaster East, Melbourne, and surrounding areas.
            </p>
            <Link href="/services" className="button button-primary">
              View Our IT Services
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
