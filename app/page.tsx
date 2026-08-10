import { HomePageClient } from "./home-page-client";
import { getPublishedSiteData } from "./site-data-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const siteData = await getPublishedSiteData();
  return <HomePageClient initialContent={siteData.content} initialEquipment={siteData.equipment} initialServices={siteData.services} />;
}
