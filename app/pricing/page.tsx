import { PricingPageClient } from "../pricing-page-client";
import { getPublishedSiteData } from "../site-data-server";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const siteData = await getPublishedSiteData();
  return <PricingPageClient initialContent={siteData.content} initialPricing={siteData.pricing} />;
}
