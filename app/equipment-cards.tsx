"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import type { InventoryItem } from "./admin/admin-data";
import { readInventoryItems } from "./inventory-store";

export function EquipmentCards() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const refresh = () => setItems(readInventoryItems());
    refresh();
    window.addEventListener("inventory-items-updated", refresh);
    return () => window.removeEventListener("inventory-items-updated", refresh);
  }, []);

  const publicEquipment = items.filter((item) => item.type === "Equipment" && item.publicVisible);

  return (
    <div className="equipment-grid">
      {publicEquipment.map((item) => {
        const href = `/?${new URLSearchParams({ requestType: "Equipment enquiry", service: item.name }).toString()}#support-assistant`;
        return (
          <article className="equipment-card" key={item.sku}>
            <div className={`equipment-visual ${item.imageUrl ? "has-image" : "image-missing"}`}>
              <b aria-hidden="true">IT</b>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                    event.currentTarget.parentElement?.classList.add("image-missing");
                  }}
                />
              )}
              <span>{item.condition}</span>
            </div>
            <div className="equipment-body">
              <span className="status">{item.quantity > 0 ? "Available" : "Ask us"}</span>
              <h3>{item.name}</h3>
              <p>{item.category} - {item.condition} - {item.quantity} available</p>
              <strong>${item.salePrice}</strong>
              <a href={href}>Ask about this item <span aria-hidden="true">-&gt;</span></a>
            </div>
          </article>
        );
      })}
      {publicEquipment.length === 0 && <div className="empty-note">No equipment is currently marked visible.</div>}
    </div>
  );
}
