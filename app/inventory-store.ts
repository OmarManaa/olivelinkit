"use client";

import { inventory, type InventoryItem } from "./admin/admin-data";

const STORAGE_KEY = "it-services-inventory-items";

const defaultEquipmentImages: Record<string, string> = {
  "USB-C-DOCK": "/equipment/usb-c-dock.webp",
  "LAP-LAT5420": "/equipment/latitude-laptop.webp",
  "DESK-HP-800G5": "/equipment/mini-desktop.webp",
};

function withDefaults(item: InventoryItem): InventoryItem {
  return {
    ...item,
    imageUrl: item.imageUrl || defaultEquipmentImages[item.sku] || "",
  };
}

function normaliseItems(items: InventoryItem[]) {
  const bySku = new Map<string, InventoryItem>();
  for (const item of items) bySku.set(item.sku, withDefaults(item));
  return Array.from(bySku.values());
}

export function readInventoryItems(): InventoryItem[] {
  if (typeof window === "undefined") return inventory;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return inventory;
  try {
    const parsed = JSON.parse(raw) as InventoryItem[];
    return Array.isArray(parsed) && parsed.length ? normaliseItems(parsed) : inventory;
  } catch {
    return inventory;
  }
}

export function saveInventoryItems(items: InventoryItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normaliseItems(items)));
  window.dispatchEvent(new Event("inventory-items-updated"));
}

export function saveInventoryItem(item: InventoryItem) {
  const items = readInventoryItems();
  const next = items.some((entry) => entry.sku === item.sku)
    ? items.map((entry) => entry.sku === item.sku ? item : entry)
    : [item, ...items];
  saveInventoryItems(next);
  return item;
}

export function resetInventoryItems() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("inventory-items-updated"));
}
