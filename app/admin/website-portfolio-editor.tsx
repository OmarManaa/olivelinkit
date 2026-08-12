"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { defaultWebsitePortfolio, type WebsitePortfolioItem } from "../website-portfolio-data";
import { readWebsitePortfolio, resetWebsitePortfolio, saveWebsitePortfolio } from "../website-portfolio-store";
import { persistAdminState } from "../persistence-client";
import { compressImageForUpload, readMediaUploadResponse, type MediaUploadPayload } from "./image-upload-utils";

export function WebsitePortfolioEditor() {
  const [portfolio, setPortfolio] = useState<WebsitePortfolioItem[]>(defaultWebsitePortfolio);
  const [saved, setSaved] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const refresh = () => setPortfolio(readWebsitePortfolio());
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("website-portfolio-updated", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("website-portfolio-updated", refresh);
    };
  }, []);

  function updateItem(id: string, field: keyof WebsitePortfolioItem, value: string) {
    setPortfolio((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function addItem() {
    const id = `portfolio-${Date.now().toString().slice(-5)}`;
    setPortfolio((current) => [...current, { id, title: "New website example", description: "Describe the website example.", url: "https://", button: "View site" }]);
  }

  function removeItem(id: string) {
    setPortfolio((current) => current.filter((item) => item.id !== id));
  }

  async function uploadPortfolioImage(file: File, imageName: string) {
    const uploadFile = await compressImageForUpload(file, { maxWidth: 1400, maxHeight: 820, quality: 0.86 });
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("folder", "portfolio");
    formData.append("name", imageName);

    const response = await fetch("/api/admin/media", { method: "POST", body: formData });
    const payload: MediaUploadPayload = await readMediaUploadResponse(response);
    if (!response.ok || !payload.url) throw new Error(payload.error || "Image upload failed.");
    return payload.url;
  }

  async function uploadItemImage(id: string, title: string, file?: File) {
    if (!file) return;
    setUploadMessage("Uploading image...");
    setIsUploadingImage(true);

    try {
      const url = await uploadPortfolioImage(file, title || id);
      updateItem(id, "imageUrl", url);
      setUploadMessage("Image uploaded. Publish changes to show it live.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function saveAll() {
    setIsSaving(true);
    saveWebsitePortfolio(portfolio);
    const persisted = await persistAdminState("site-portfolio", portfolio);
    setSaved(persisted.ok ? "Website portfolio published." : `Saved in this browser, but not live: ${persisted.error}`);
    setIsSaving(false);
  }

  async function resetAll() {
    resetWebsitePortfolio();
    await persistAdminState("site-portfolio", null);
    setPortfolio(defaultWebsitePortfolio);
    setSaved("Website portfolio reset to the default example.");
  }

  return (
    <section className="services-editor">
      <div className="editor-actions">
        <button className="button button-ghost" onClick={addItem} type="button">Add example</button>
        <button className="button button-ghost" onClick={() => { void resetAll(); }} type="button">Reset defaults</button>
        <Link className="button button-ghost" href="/web-design">Preview web design page</Link>
        <button className="button" disabled={isSaving} onClick={() => { void saveAll(); }} type="button">{isSaving ? "Publishing..." : "Publish portfolio"}</button>
      </div>
      {saved && <div className="assistant-saved">{saved}</div>}
      {uploadMessage && <div className="assistant-saved">{uploadMessage}</div>}
      <div className="services-editor-grid">
        {portfolio.map((item) => (
          <article className="service-editor-card" key={item.id}>
            <div className="service-editor-preview">
              <div className="service-editor-image-preview">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={`Thumbnail for ${item.title}`} />
                ) : (
                  <div className="service-editor-image-placeholder">No thumbnail</div>
                )}
              </div>
              <div>
                <strong>{item.title}</strong>
                <small>{item.url}</small>
              </div>
            </div>
            <label><span>Title</span><input value={item.title} onChange={(event) => updateItem(item.id, "title", event.target.value)} /></label>
            <label className="full"><span>Description</span><textarea rows={4} value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} /></label>
            <label><span>URL</span><input value={item.url} onChange={(event) => updateItem(item.id, "url", event.target.value)} /></label>
            <label><span>Button text</span><input value={item.button} onChange={(event) => updateItem(item.id, "button", event.target.value)} /></label>
            <label className="full"><span>Image URL (optional)</span><input value={item.imageUrl ?? ""} onChange={(event) => updateItem(item.id, "imageUrl", event.target.value)} /></label>
            <label className="full"><span>Upload screenshot or image</span><input accept="image/*" disabled={isUploadingImage} onChange={(event) => { const file = event.target.files?.[0]; if (file) { void uploadItemImage(item.id, item.title, file); event.currentTarget.value = ""; } }} type="file" /></label>
            <button className="table-link remove-service" onClick={() => removeItem(item.id)} type="button">Remove example</button>
          </article>
        ))}
      </div>
    </section>
  );
}
