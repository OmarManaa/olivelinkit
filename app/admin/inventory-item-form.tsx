"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { InventoryItem } from "./admin-data";
import { readInventoryItems, saveInventoryItem } from "../inventory-store";

type InventoryItemFormProps = {
  initialItem?: InventoryItem;
  mode: "inventory" | "equipment";
  sku?: string;
};

function blankItem(mode: "inventory" | "equipment", sku = ""): InventoryItem {
  return {
    sku: sku || `${mode === "equipment" ? "EQ" : "ITEM"}-${Date.now().toString().slice(-5)}`,
    name: "",
    category: mode === "equipment" ? "Laptop" : "Parts",
    quantity: 1,
    reorderLevel: 1,
    salePrice: 0,
    condition: mode === "equipment" ? "Tested" : "New",
    type: mode === "equipment" ? "Equipment" : "Parts",
    publicVisible: mode === "equipment",
    imageUrl: "",
    updatedAt: "Just now",
  };
}

export function InventoryItemForm({ initialItem, mode, sku }: InventoryItemFormProps) {
  const router = useRouter();
  const initialFormItem = useMemo(() => {
    const stored = sku ? readInventoryItems().find((entry) => entry.sku === sku) : undefined;
    return stored ?? initialItem ?? blankItem(mode, sku);
  }, [initialItem, mode, sku]);
  const [item, setItem] = useState<InventoryItem>(initialFormItem);
  const isEquipment = item.type === "Equipment";

  const publicHint = useMemo(() => {
    if (!isEquipment) return "Only equipment can be shown on the public website.";
    return item.publicVisible ? "Visible on the public Equipment section." : "Hidden from the public Equipment section.";
  }, [isEquipment, item.publicVisible]);

  function update(field: keyof InventoryItem, value: string | number | boolean) {
    setItem((current) => ({ ...current, [field]: value }));
  }

  function save() {
    saveInventoryItem({ ...item, updatedAt: "Just now", publicVisible: item.type === "Equipment" ? item.publicVisible : false });
    router.push(`/admin/${mode}`);
  }

  return (
    <form className="admin-form">
      <label><span>SKU / asset tag</span><input value={item.sku} onChange={(event) => update("sku", event.target.value)} /></label>
      <label><span>Item name</span><input value={item.name} onChange={(event) => update("name", event.target.value)} /></label>
      <label><span>Category</span><input value={item.category} onChange={(event) => update("category", event.target.value)} /></label>
      <label><span>Type</span><select value={item.type} onChange={(event) => update("type", event.target.value as InventoryItem["type"])}><option>Parts</option><option>Equipment</option></select></label>
      <label><span>Condition</span><select value={item.condition} onChange={(event) => update("condition", event.target.value as InventoryItem["condition"])}><option>New</option><option>Tested</option><option>Refurbished</option><option>Used</option></select></label>
      <label><span>Quantity</span><input min="0" type="number" value={item.quantity} onChange={(event) => update("quantity", Number(event.target.value) || 0)} /></label>
      <label><span>Reorder level</span><input min="0" type="number" value={item.reorderLevel} onChange={(event) => update("reorderLevel", Number(event.target.value) || 0)} /></label>
      <label><span>Sale price</span><input min="0" type="number" value={item.salePrice} onChange={(event) => update("salePrice", Number(event.target.value) || 0)} /></label>
      <label className="full">
        <span>Public image URL</span>
        <input value={item.imageUrl ?? ""} onChange={(event) => update("imageUrl", event.target.value)} placeholder="/equipment/latitude-laptop.webp" />
      </label>
      <label>
        <span>Public website</span>
        <select disabled={!isEquipment} value={item.publicVisible ? "yes" : "no"} onChange={(event) => update("publicVisible", event.target.value === "yes")}>
          <option value="yes">Visible</option>
          <option value="no">Hidden</option>
        </select>
      </label>
      <div className="lookup-summary"><span>Website visibility</span><strong>{publicHint}</strong><small>Visible equipment appears on the public home page.</small></div>
      {isEquipment && item.imageUrl && (
        <div className="equipment-image-preview full">
          <img src={item.imageUrl} alt={`${item.name || "Equipment"} public card preview`} />
          <span>Public card image preview</span>
        </div>
      )}
      <label className="full"><span>Internal notes</span><textarea rows={5} defaultValue={`${item.name || "Item"} reviewed ${item.updatedAt}.`} /></label>
      <div className="form-actions">
        <Link className="button button-ghost" href={`/admin/${mode}`}>Cancel</Link>
        <button className="button" onClick={save} type="button">Save item</button>
      </div>
    </form>
  );
}
