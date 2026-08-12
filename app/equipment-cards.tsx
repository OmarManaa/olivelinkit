"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type PointerEvent } from "react";
import type { InventoryItem } from "./admin/admin-data";
import { hasStoredInventoryItems, readInventoryItems } from "./inventory-store";

type EquipmentCardsProps = {
  initialItems?: InventoryItem[];
};

type SiteDataPayload = {
  equipment?: InventoryItem[];
};

function publicEquipment(items: InventoryItem[]) {
  return items.filter((item) => item.type === "Equipment" && item.publicVisible);
}

function itemHref(item: InventoryItem) {
  return `/?${new URLSearchParams({
    requestType: "Equipment enquiry",
    service: item.name,
    itemSku: item.sku,
    itemName: item.name,
    itemCategory: item.category,
    itemCondition: item.condition,
    itemPrice: String(item.salePrice),
    itemQuantity: String(item.quantity),
  }).toString()}#support-assistant`;
}

function galleryFor(item: InventoryItem) {
  return Array.from(new Set([item.imageUrl, ...(item.galleryUrls ?? [])].map((url) => url?.trim()).filter(Boolean) as string[]));
}

function itemMeta(item: InventoryItem) {
  return [item.category, item.condition, `${item.quantity} available`].filter(Boolean).join(" - ");
}

export function EquipmentCards({ initialItems = [] }: EquipmentCardsProps) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number } | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      if (hasStoredInventoryItems()) {
        if (active) setItems(readInventoryItems());
        return;
      }

      try {
        const response = await fetch("/api/site-data", { cache: "no-store" });
        if (!response.ok) throw new Error("Site data unavailable.");
        const payload = await response.json() as SiteDataPayload;
        if (active && Array.isArray(payload.equipment)) setItems(payload.equipment);
      } catch {
        if (active) setItems(readInventoryItems());
      }
    }

    void refresh();
    window.addEventListener("inventory-items-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("inventory-items-updated", refresh);
    };
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedItem]);

  const visibleEquipment = publicEquipment(items);
  const modalPhotos = selectedItem ? galleryFor(selectedItem) : [];
  const modalPhoto = selectedPhoto || modalPhotos[0] || "";

  function openItem(item: InventoryItem) {
    setSelectedItem(item);
    setSelectedPhoto(galleryFor(item)[0] ?? "");
    setZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    setDragOrigin(null);
    setDragStartOffset(null);
  }

  function closeModal() {
    setSelectedItem(null);
    setZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    setDragOrigin(null);
    setDragStartOffset(null);
  }

  useEffect(() => {
    setZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    setDragOrigin(null);
    setDragStartOffset(null);
  }, [selectedPhoto, selectedItem]);

  function handleImagePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!zoomed || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragOrigin({ x: event.clientX, y: event.clientY });
    setDragStartOffset(panOffset);
  }

  function handleImagePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!zoomed || !dragOrigin || !dragStartOffset) return;
    const deltaX = event.clientX - dragOrigin.x;
    const deltaY = event.clientY - dragOrigin.y;
    setPanOffset({ x: dragStartOffset.x + deltaX, y: dragStartOffset.y + deltaY });
  }

  function endImageDrag(event: PointerEvent<HTMLDivElement>) {
    if (!zoomed) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragOrigin(null);
    setDragStartOffset(null);
  }

  return (
    <>
      <div className="equipment-grid">
        {visibleEquipment.map((item) => {
          const href = itemHref(item);
          return (
            <article className="equipment-card" key={item.sku}>
              <button
                aria-label={`View details and photos for ${item.name}`}
                className={`equipment-visual ${item.imageUrl ? "has-image" : "image-missing"}`}
                onClick={() => openItem(item)}
                type="button"
              >
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
              </button>
              <div className="equipment-body">
                <span className="status">{item.quantity > 0 ? "Available" : "Ask us"}</span>
                <h3>{item.name}</h3>
                <p>{itemMeta(item)}</p>
                {item.description && <p className="equipment-description">{item.description}</p>}
                {(item.specs || item.warranty) && (
                  <details className="equipment-details">
                    <summary>View details</summary>
                    <dl>
                      <div><dt>SKU</dt><dd>{item.sku}</dd></div>
                      {item.specs && <div><dt>Specifications</dt><dd>{item.specs}</dd></div>}
                      {item.warranty && <div><dt>Warranty</dt><dd>{item.warranty}</dd></div>}
                    </dl>
                  </details>
                )}
                <strong>${item.salePrice}</strong>
                <a href={href}>Ask about this item <span aria-hidden="true">-&gt;</span></a>
              </div>
            </article>
          );
        })}
        {visibleEquipment.length === 0 && <div className="empty-note">No equipment is currently marked visible.</div>}
      </div>

      {selectedItem && (
        <div className="equipment-modal" role="dialog" aria-modal="true" aria-labelledby="equipment-modal-title">
          <button className="equipment-modal-backdrop" onClick={() => setSelectedItem(null)} type="button" aria-label="Close item details" />
          <section className="equipment-modal-shell">
            <button className="equipment-modal-close" onClick={closeModal} type="button" aria-label="Close item details">x</button>
            <div className="equipment-modal-gallery">
              <div className={`equipment-modal-main ${modalPhoto ? "has-image" : "image-missing"}${zoomed ? " zoomed" : ""}`}>
                {modalPhoto ? (
                  <>
                    <div
                      className={`equipment-modal-image-wrapper${dragOrigin ? " dragging" : ""}`}
                      onPointerDown={handleImagePointerDown}
                      onPointerMove={handleImagePointerMove}
                      onPointerUp={endImageDrag}
                      onPointerCancel={endImageDrag}
                      onPointerLeave={endImageDrag}
                      style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
                    >
                      <img src={modalPhoto} alt={selectedItem.name} draggable={false} />
                    </div>
                    <button
                      type="button"
                      className="equipment-modal-zoom-toggle"
                      onClick={() => setZoomed((current) => !current)}
                      aria-pressed={zoomed}
                      aria-label={zoomed ? "Zoom out image" : "Zoom in image"}
                    >
                      <span className="equipment-modal-zoom-label">
                        {zoomed ? "Click to zoom out. Drag to pan." : "Click to zoom in. Pinch to zoom on touch."}
                      </span>
                    </button>
                  </>
                ) : (
                  <b aria-hidden="true">IT</b>
                )}
              </div>
              {modalPhotos.length > 1 && (
                <div className="equipment-thumbnails" aria-label="Item photos">
                  {modalPhotos.map((photo, index) => (
                    <button
                      aria-label={`Show photo ${index + 1} for ${selectedItem.name}`}
                      className={photo === modalPhoto ? "active" : ""}
                      key={photo}
                      onClick={() => setSelectedPhoto(photo)}
                      type="button"
                    >
                      <img src={photo} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="equipment-modal-copy">
              <span className="status">{selectedItem.quantity > 0 ? "Available" : "Ask us"}</span>
              <h2 id="equipment-modal-title">{selectedItem.name}</h2>
              <p>{itemMeta(selectedItem)}</p>
              {selectedItem.description && <p>{selectedItem.description}</p>}
              <dl>
                <div><dt>SKU</dt><dd>{selectedItem.sku}</dd></div>
                {selectedItem.specs && <div><dt>Specifications</dt><dd>{selectedItem.specs}</dd></div>}
                {selectedItem.warranty && <div><dt>Warranty</dt><dd>{selectedItem.warranty}</dd></div>}
              </dl>
              <strong>${selectedItem.salePrice}</strong>
              <a className="button" href={itemHref(selectedItem)} onClick={() => setSelectedItem(null)}>Buy or ask about this item</a>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
