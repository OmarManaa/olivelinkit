import type { Metadata } from "next";
import "./globals.css";
import { getPublishedSiteData } from "./site-data-server";
import { defaultWebsiteContent } from "./website-content-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://olivelinkit.au";

function staticMetadata(iconUrl: string): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "OliveLink IT Solutions | Melbourne IT Support & Website Design",
      template: "%s | OliveLink IT Solutions",
    },
    description: "Practical computer repairs, networking, business IT, website design, and data recovery services for Melbourne small businesses.",
    openGraph: {
      title: "OliveLink IT Solutions | IT Support, Website Design & Data Recovery",
      description: "Reliable IT support, website design, web support, and recovery services for Melbourne businesses.",
      type: "website",
      locale: "en_AU",
      ...(siteUrl ? { images: [{ url: "/hero-it-support.png", width: 1600, height: 900, alt: "Technician configuring a business network" }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: "OliveLink IT Solutions | Website Design & Small Business IT Support",
      description: "Website design, IT support, remote help, and data recovery services for Melbourne small businesses.",
    },
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl,
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteData = await getPublishedSiteData();
    const iconUrl = siteData.content.faviconUrl || siteData.content.logoUrl || defaultWebsiteContent.faviconUrl;
    return staticMetadata(iconUrl);
  } catch {
    return staticMetadata(defaultWebsiteContent.faviconUrl);
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body className="antialiased">{children}</body>
    </html>
  );
}
