import type { Metadata } from "next";
import "./globals.css";
import { getPublishedSiteData } from "./site-data-server";
import { defaultWebsiteContent } from "./website-content-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://olivelinkit.au";

function staticMetadata(iconUrl: string): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "OliveLink IT | Melbourne IT Support",
      template: "%s | OliveLink IT",
    },
    description: "Practical computer repairs, networking, business IT, security, remote support and refurbished equipment in Melbourne.",
    openGraph: {
      title: "OliveLink IT | Melbourne IT Support",
      description: "Reliable IT support and practical technology advice for individuals, small businesses and growing teams.",
      type: "website",
      locale: "en_AU",
      ...(siteUrl ? { images: [{ url: "/hero-it-support.png", width: 1600, height: 900, alt: "Technician configuring a business network" }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: "OliveLink IT | Melbourne IT Support",
      description: "Reliable IT support and practical technology advice for individuals, small businesses and growing teams.",
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
