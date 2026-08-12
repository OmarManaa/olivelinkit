import { inArray } from "drizzle-orm";
import { getDb } from "../db";
import { appState } from "../db/schema";
import { inventory, type InventoryItem } from "./admin/admin-data";
import { mergeWebsiteContent, type WebsiteContent } from "./website-content-data";
import { mergeWebsitePricing, type WebsitePricingContent } from "./website-pricing-data";
import { defaultWebsiteServices, type WebsiteService } from "./website-services-data";
import { defaultWebsitePortfolio, type WebsitePortfolioItem } from "./website-portfolio-data";

export type PublishedSiteData = {
  content: WebsiteContent;
  services: WebsiteService[];
  pricing: WebsitePricingContent;
  portfolio: WebsitePortfolioItem[];
  equipment: InventoryItem[];
};

function parseValue<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function publicEquipment(items: InventoryItem[]) {
  return items.filter((item) => item.type === "Equipment" && item.publicVisible);
}

export async function getPublishedSiteData(): Promise<PublishedSiteData> {
  const fallback: PublishedSiteData = {
    content: mergeWebsiteContent({}),
    services: defaultWebsiteServices,
    pricing: mergeWebsitePricing({}),
    portfolio: defaultWebsitePortfolio,
    equipment: publicEquipment(inventory),
  };

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(appState)
      .where(inArray(appState.key, ["site-content", "site-services", "site-pricing", "site-portfolio", "inventory"]));
    const values = new Map(rows.map((row) => [row.key, row.value]));
    const savedInventory = parseValue(values.get("inventory"), inventory);

    return {
      content: mergeWebsiteContent(parseValue<Partial<WebsiteContent>>(values.get("site-content"), {})),
      services: parseValue(values.get("site-services"), defaultWebsiteServices),
      pricing: mergeWebsitePricing(parseValue<Partial<WebsitePricingContent>>(values.get("site-pricing"), {})),
      portfolio: parseValue(values.get("site-portfolio"), defaultWebsitePortfolio),
      equipment: publicEquipment(savedInventory),
    };
  } catch {
    return fallback;
  }
}
