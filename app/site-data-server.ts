import { inArray } from "drizzle-orm";
import { getDb } from "../db";
import { appState } from "../db/schema";
import { inventory, type InventoryItem } from "./admin/admin-data";
import { defaultWebsiteContent, type WebsiteContent } from "./website-content-data";
import { defaultWebsiteServices, type WebsiteService } from "./website-services-data";

export type PublishedSiteData = {
  content: WebsiteContent;
  services: WebsiteService[];
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

function mergeContent(input: Partial<WebsiteContent>) {
  return {
    ...defaultWebsiteContent,
    ...input,
    theme: { ...defaultWebsiteContent.theme, ...input.theme },
  };
}

export async function getPublishedSiteData(): Promise<PublishedSiteData> {
  const fallback: PublishedSiteData = {
    content: defaultWebsiteContent,
    services: defaultWebsiteServices,
    equipment: publicEquipment(inventory),
  };

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(appState)
      .where(inArray(appState.key, ["site-content", "site-services", "inventory"]));
    const values = new Map(rows.map((row) => [row.key, row.value]));
    const savedInventory = parseValue(values.get("inventory"), inventory);

    return {
      content: mergeContent(parseValue<Partial<WebsiteContent>>(values.get("site-content"), {})),
      services: parseValue(values.get("site-services"), defaultWebsiteServices),
      equipment: publicEquipment(savedInventory),
    };
  } catch {
    return fallback;
  }
}
