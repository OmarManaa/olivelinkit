"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { InventoryItem } from "./admin-data";
import { readInventoryItems, saveInventoryItem } from "../inventory-store";
import { persistAdminState } from "../persistence-client";

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
    galleryUrls: [],
    updatedAt: "Just now",
  };
}

function isUploadedImage(value?: string) {
  return Boolean(value?.startsWith("/api/media/") || value?.startsWith("data:image/"));
}

function mediaKeyFromUrl(value?: string) {
  if (!value?.startsWith("/api/media/")) return "";
  return decodeURIComponent(value.slice("/api/media/".length));
}

function uniqueUrls(urls: string[]) {
  return Array.from(new Set(urls.map((url) => url.trim()).filter(Boolean)));
}

function parseGalleryUrls(value: string) {
  return uniqueUrls(value.split(/[\n,]+/));
}

function formatGalleryUrls(urls?: string[]) {
  return uniqueUrls(urls ?? []).join("\n");
}

function imageFromObjectUrl(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = url;
  });
}

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Choose a JPEG, PNG, or WebP image.");

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await imageFromObjectUrl(objectUrl);
    const maxWidth = 1400;
    const maxHeight = 820;
    const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is not available in this browser.");
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.84));
    if (!blob) throw new Error("Image could not be compressed.");

    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function InventoryItemForm({ initialItem, mode, sku }: InventoryItemFormProps) {
  const router = useRouter();
  const initialFormItem = useMemo(() => {
    const stored = sku ? readInventoryItems().find((entry) => entry.sku === sku) : undefined;
    return stored ?? initialItem ?? blankItem(mode, sku);
  }, [initialItem, mode, sku]);
  const [item, setItem] = useState<InventoryItem>(initialFormItem);
  const [galleryInput, setGalleryInput] = useState(() => formatGalleryUrls(initialFormItem.galleryUrls));
  const [mainImageName, setMainImageName] = useState(() => initialFormItem.name || initialFormItem.sku || "equipment-main-photo");
  const [galleryImageName, setGalleryImageName] = useState(() => initialFormItem.name ? `${initialFormItem.name} gallery` : "equipment-gallery-photo");
  const [imageMessage, setImageMessage] = useState("");
  const isEquipment = item.type === "Equipment";
  const uploadedImage = isUploadedImage(item.imageUrl);

  useEffect(() => {
    if (!sku) return;
    const refresh = () => {
      const stored = readInventoryItems().find((entry) => entry.sku === sku);
      if (stored) {
        setItem(stored);
        setGalleryInput(formatGalleryUrls(stored.galleryUrls));
      }
    };
    refresh();
    window.addEventListener("inventory-items-updated", refresh);
    return () => window.removeEventListener("inventory-items-updated", refresh);
  }, [sku]);

  const publicHint = useMemo(() => {
    if (!isEquipment) return "Only equipment can be shown on the public website.";
    return item.publicVisible ? "Visible on the public Equipment section." : "Hidden from the public Equipment section.";
  }, [isEquipment, item.publicVisible]);

  function update<K extends keyof InventoryItem>(field: K, value: InventoryItem[K]) {
    setItem((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    saveInventoryItem({
      ...item,
      galleryUrls: uniqueUrls(item.galleryUrls ?? []).filter((url) => url !== item.imageUrl),
      updatedAt: "Just now",
      publicVisible: item.type === "Equipment" ? item.publicVisible : false,
    });
    await persistAdminState("inventory", readInventoryItems());
    router.push(`/admin/${mode}`);
  }

  async function uploadMedia(file: File, imageName?: string) {
    const image = await compressImage(file);
    const formData = new FormData();
    formData.append("file", new File([image], `${file.name.replace(/\.[^.]+$/, "") || "equipment"}.webp`, { type: "image/webp" }));
    const trimmedName = imageName?.trim();
    if (trimmedName) formData.append("name", trimmedName);
    const response = await fetch("/api/admin/media", { method: "POST", body: formData });
    const payload = await response.json() as { url?: string; error?: string };
    if (!response.ok || !payload.url) throw new Error(payload.error || "Image upload failed.");
    return payload.url;
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    try {
      const url = await uploadMedia(file, mainImageName || item.name || item.sku);
      const previousKey = mediaKeyFromUrl(item.imageUrl);
      update("imageUrl", url);
      if (previousKey) void fetch(`/api/admin/media?key=${encodeURIComponent(previousKey)}`, { method: "DELETE" });
      setImageMessage(`${file.name} uploaded, optimised, and stored for the public equipment card.`);
    } catch (error) {
      setImageMessage(error instanceof Error ? error.message : "Image upload failed.");
    }
  }

  async function uploadGalleryImages(files?: FileList | null) {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) return;
    try {
      setImageMessage(`Uploading ${selectedFiles.length} item photo${selectedFiles.length === 1 ? "" : "s"}...`);
      const uploadedUrls: string[] = [];
      for (const [index, file] of selectedFiles.entries()) {
        const name = galleryImageName || `${item.name || item.sku || "equipment"} gallery ${index + 1}`;
        uploadedUrls.push(await uploadMedia(file, selectedFiles.length === 1 ? name : `${name} ${index + 1}`));
      }

      setItem((current) => {
        const primaryImage = current.imageUrl || uploadedUrls[0] || "";
        const addedGalleryUrls = current.imageUrl ? uploadedUrls : uploadedUrls.slice(1);
        const galleryUrls = uniqueUrls([...(current.galleryUrls ?? []), ...addedGalleryUrls]).filter((url) => url !== primaryImage);
        setGalleryInput(formatGalleryUrls(galleryUrls));
        return { ...current, imageUrl: primaryImage, galleryUrls };
      });
      setImageMessage(`${selectedFiles.length} item photo${selectedFiles.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      setImageMessage(error instanceof Error ? error.message : "Image upload failed.");
    }
  }

  function updateGalleryUrls(value: string) {
    setGalleryInput(value);
    update("galleryUrls", parseGalleryUrls(value));
  }

  function removeGalleryImage(url: string) {
    const galleryUrls = uniqueUrls(item.galleryUrls ?? []).filter((candidate) => candidate !== url);
    update("galleryUrls", galleryUrls);
    setGalleryInput(formatGalleryUrls(galleryUrls));
    const key = mediaKeyFromUrl(url);
    if (key) void fetch(`/api/admin/media?key=${encodeURIComponent(key)}`, { method: "DELETE" });
  }

  function removeImage() {
    const key = mediaKeyFromUrl(item.imageUrl);
    update("imageUrl", "");
    if (key) void fetch(`/api/admin/media?key=${encodeURIComponent(key)}`, { method: "DELETE" });
    setImageMessage("Image removed from this item.");
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
        <label className="full"><span>Public description</span><textarea rows={3} value={item.description ?? ""} onChange={(event) => update("description", event.target.value)} placeholder="What is included, who it suits, and key condition notes" /></label>
        <label><span>Key specifications</span><input value={item.specs ?? ""} onChange={(event) => update("specs", event.target.value)} placeholder="e.g. i5, 16GB RAM, 512GB SSD" /></label>
        <label><span>Warranty</span><input value={item.warranty ?? ""} onChange={(event) => update("warranty", event.target.value)} placeholder="e.g. 90-day warranty" /></label>
      <div className="product-media-panel full">
        <section className="product-media-column" aria-labelledby="main-photo-heading">
          <div className="product-media-heading">
            <span id="main-photo-heading">Main card photo</span>
            <small>Used on the public card and as the first dialog image.</small>
          </div>
          <label>
            <span>Public image URL</span>
            <input value={uploadedImage ? "" : item.imageUrl ?? ""} onChange={(event) => { update("imageUrl", event.target.value); setImageMessage(""); }} placeholder={uploadedImage ? "Uploaded image saved with this item" : "/equipment/latitude-laptop.webp"} />
          </label>
          <label>
            <span>Main photo name</span>
            <input value={mainImageName} onChange={(event) => setMainImageName(event.target.value)} placeholder="hp-elitedesk-front" />
          </label>
          <label>
            <span>Upload main photo</span>
            <input accept="image/*" onChange={(event) => { uploadImage(event.target.files?.[0]); event.currentTarget.value = ""; }} type="file" />
          </label>
          <div className="media-status">
            <strong>{uploadedImage ? "Uploaded main photo active" : "Use an upload or URL"}</strong>
            {item.imageUrl && <button className="table-link table-button" onClick={removeImage} type="button">Remove main photo</button>}
          </div>
        </section>
        <section className="product-media-column" aria-labelledby="gallery-photo-heading">
          <div className="product-media-heading">
            <span id="gallery-photo-heading">Dialog gallery photos</span>
            <small>These appear as thumbnails inside the item detail dialog.</small>
          </div>
          <label>
            <span>Gallery photo name</span>
            <input value={galleryImageName} onChange={(event) => setGalleryImageName(event.target.value)} placeholder="hp-elitedesk-gallery" />
          </label>
          <label>
            <span>Upload multiple gallery photos</span>
            <input accept="image/*" multiple onChange={(event) => { void uploadGalleryImages(event.target.files); event.currentTarget.value = ""; }} type="file" />
          </label>
          <label>
            <span>Extra image URLs</span>
            <textarea rows={3} value={galleryInput} onChange={(event) => updateGalleryUrls(event.target.value)} placeholder="/equipment/detail-1.webp&#10;/equipment/detail-2.webp" />
          </label>
        </section>
      </div>
      {imageMessage && <div className="assistant-saved full">{imageMessage}</div>}
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
          <span>Main card photo preview</span>
        </div>
      )}
      {isEquipment && (item.galleryUrls?.length ?? 0) > 0 && (
        <div className="equipment-gallery-preview full">
          {uniqueUrls(item.galleryUrls ?? []).map((url, index) => (
            <div key={url}>
              <img src={url} alt={`${item.name || "Equipment"} gallery photo ${index + 1}`} />
              <button className="table-link table-button" onClick={() => removeGalleryImage(url)} type="button">Remove</button>
            </div>
          ))}
        </div>
      )}
      <label className="full"><span>Internal notes</span><textarea rows={5} defaultValue={`${item.name || "Item"} reviewed ${item.updatedAt}.`} /></label>
      <div className="form-actions">
        <Link className="button button-ghost" href={`/admin/${mode}`}>Cancel</Link>
        <button className="button" onClick={() => { void save(); }} type="button">Save item</button>
      </div>
    </form>
  );
}
