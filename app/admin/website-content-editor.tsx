"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { defaultWebsiteContent, websiteThemePresets, type WebsiteAudience, type WebsiteContent, type WebsiteTestimonial, type WebsiteTheme } from "../website-content-data";
import { readWebsiteContent, resetWebsiteContent, saveWebsiteContent } from "../website-content-store";
import { persistAdminState } from "../persistence-client";

type ContentTab = "brand" | "hero" | "theme" | "journey" | "sections" | "contact" | "legal";

const tabs: { id: ContentTab; label: string }[] = [
  { id: "brand", label: "Brand" },
  { id: "hero", label: "Hero" },
  { id: "theme", label: "Theme" },
  { id: "journey", label: "Support Journey" },
  { id: "sections", label: "Page Sections" },
  { id: "contact", label: "Contact & Footer" },
  { id: "legal", label: "Invoice & Legal" },
];

function lines(value: string[]) {
  return value.join("\n");
}

function fromLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function WebsiteContentEditor() {
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent);
  const [activeTab, setActiveTab] = useState<ContentTab>("brand");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  useEffect(() => {
    const refresh = () => setContent(readWebsiteContent());
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("website-content-updated", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("website-content-updated", refresh);
    };
  }, []);

  function update(field: keyof WebsiteContent, value: string | string[] | boolean) {
    setContent((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setSaved("");
  }

  function updateTheme(field: keyof WebsiteTheme, value: string) {
    setContent((current) => ({
      ...current,
      theme: {
        ...(current.theme ?? defaultWebsiteContent.theme),
        [field]: value,
        preset: field === "preset" ? value as WebsiteTheme["preset"] : "custom",
      },
    }));
    setDirty(true);
    setSaved("");
  }

  function applyThemePreset(preset: Exclude<WebsiteTheme["preset"], "custom">) {
    setContent((current) => ({ ...current, theme: websiteThemePresets[preset] }));
    setDirty(true);
    setSaved("");
  }

  function updateStep(index: number, field: "title" | "text" | "number", value: string) {
    setContent((current) => ({
      ...current,
      processSteps: current.processSteps.map((step, stepIndex) => stepIndex === index ? { ...step, [field]: value } : step),
    }));
    setDirty(true);
    setSaved("");
  }

  function updateAudience(index: number, field: keyof WebsiteAudience, value: string) {
    setContent((current) => ({
      ...current,
      audienceItems: current.audienceItems.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
    setDirty(true);
    setSaved("");
  }

  function updateHighlight(index: number, field: "title" | "text", value: string) {
    setContent((current) => ({
      ...current,
      serviceHighlights: current.serviceHighlights.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
    setDirty(true);
    setSaved("");
  }

  function updateTestimonial(index: number, field: keyof WebsiteTestimonial, value: string) {
    setContent((current) => ({
      ...current,
      testimonials: current.testimonials.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
    setDirty(true);
    setSaved("");
  }

  function addTestimonial() {
    setContent((current) => ({
      ...current,
      testimonials: [...current.testimonials, { quote: "", name: "", context: "" }],
    }));
    setDirty(true);
    setSaved("");
  }

  function removeTestimonial(index: number) {
    setContent((current) => ({ ...current, testimonials: current.testimonials.filter((_, itemIndex) => itemIndex !== index) }));
    setDirty(true);
    setSaved("");
  }

  async function save() {
    setIsSaving(true);
    const publishedContent = {
      ...content,
      testimonials: content.testimonials.filter((testimonial) => testimonial.name.trim() && testimonial.quote.trim()),
    };
    saveWebsiteContent(publishedContent);
    setContent(publishedContent);
    setDirty(false);
    const persisted = await persistAdminState("site-content", publishedContent);
    setSaved(persisted.ok ? "Website content published." : `Saved in this browser, but not live: ${persisted.error}`);
    setIsSaving(false);
  }

  async function reset() {
    if (!window.confirm("Reset all website content to the original defaults? This replaces every unsaved and saved content change.")) return;
    resetWebsiteContent();
    await persistAdminState("site-content", null);
    setContent(defaultWebsiteContent);
    setDirty(false);
    setSaved("Website content reset to defaults.");
    setActiveTab("brand");
  }

  async function uploadHeroImage(file?: File) {
    if (!file) return;
    setIsUploadingHero(true);
    setSaved("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "hero");
      const response = await fetch("/api/admin/media", { method: "POST", body: formData });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "Hero image upload failed.");
      update("heroImageUrl", payload.url);
      setSaved("Hero image uploaded. Publish changes to show it on the public website.");
    } catch (error) {
      setSaved(error instanceof Error ? error.message : "Hero image upload failed.");
    } finally {
      setIsUploadingHero(false);
    }
  }

  async function uploadLogoImage(file?: File) {
    if (!file) return;
    setIsUploadingLogo(true);
    setSaved("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "logo");
      const response = await fetch("/api/admin/media", { method: "POST", body: formData });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "Logo upload failed.");
      update("logoUrl", payload.url);
      setSaved("Logo uploaded. Publish changes to show it on the public website.");
    } catch (error) {
      setSaved(error instanceof Error ? error.message : "Logo upload failed.");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  async function uploadFaviconImage(file?: File) {
    if (!file) return;
    setIsUploadingFavicon(true);
    setSaved("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "favicon");
      const response = await fetch("/api/admin/media", { method: "POST", body: formData });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "Browser tab icon upload failed.");
      update("faviconUrl", payload.url);
      setSaved("Browser tab icon uploaded. Publish changes to update the live website tab.");
    } catch (error) {
      setSaved(error instanceof Error ? error.message : "Browser tab icon upload failed.");
    } finally {
      setIsUploadingFavicon(false);
    }
  }

  const theme = content.theme ?? defaultWebsiteContent.theme;

  return (
    <section className="content-editor">
      <header className="content-editor-toolbar">
        <div>
          <span>Homepage content</span>
          <strong>{dirty ? "Unsaved changes" : "All changes saved"}</strong>
        </div>
        <div className="editor-actions">
          <Link className="button button-ghost" href="/">Preview website</Link>
          <button className="button button-ghost" onClick={() => { void reset(); }} type="button">Reset all</button>
          <button className="button" disabled={isSaving} onClick={() => { void save(); }} type="button">{isSaving ? "Publishing..." : "Publish changes"}</button>
        </div>
      </header>
      {saved && <div className="assistant-saved">{saved}</div>}

      <div className="content-editor-tabs" role="tablist" aria-label="Website content areas">
        {tabs.map((tab) => (
          <button
            aria-controls={`content-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? "active" : ""}
            id={`content-tab-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div aria-labelledby={`content-tab-${activeTab}`} className="content-editor-panel" id={`content-panel-${activeTab}`} role="tabpanel">
        {activeTab === "brand" && (
          <article className="content-editor-card">
            <header><span>Public identity</span><h2>Brand and logo</h2></header>
            <div className="logo-editor-preview full">
              <img src={content.logoUrl || defaultWebsiteContent.logoUrl} alt="" height={82} width={82} />
              <div>
                <strong>Current website logo</strong>
                <small>Upload a new PNG, JPEG, or WebP logo, then publish changes.</small>
              </div>
            </div>
            <label><span>Brand title</span><input value={content.brandTitle} onChange={(event) => update("brandTitle", event.target.value)} /></label>
            <label><span>Brand subtitle</span><input value={content.brandSubtitle} onChange={(event) => update("brandSubtitle", event.target.value)} /></label>
            <label><span>Logo image URL</span><input value={content.logoUrl} onChange={(event) => update("logoUrl", event.target.value)} placeholder="/brand/olivelinkit-bubble-logo.png" /></label>
            <label><span>Logo alt text</span><input value={content.logoAlt} onChange={(event) => update("logoAlt", event.target.value)} /></label>
            <label className="full"><span>Upload logo image</span><input accept="image/webp,image/jpeg,image/png" disabled={isUploadingLogo} onChange={(event) => { void uploadLogoImage(event.target.files?.[0]); event.currentTarget.value = ""; }} type="file" /></label>
            <div className="content-field-group full">
              <strong>Quick logo choices</strong>
              <div className="inline-button-row">
                <button className="table-link table-button" onClick={() => update("logoUrl", "/brand/olivelinkit-bubble-logo.png")} type="button">Bubble mark</button>
                <button className="table-link table-button" onClick={() => update("logoUrl", "/brand/olivelinkit-palestine-map-logo-mark.png")} type="button">Palestine mark</button>
              </div>
            </div>
            <div className="logo-editor-preview full">
              <img src={content.faviconUrl || content.logoUrl || defaultWebsiteContent.faviconUrl} alt="" height={82} width={82} />
              <div>
                <strong>Current browser tab icon</strong>
                <small>Use a square PNG, JPEG, or WebP mark. Browsers may cache old tab icons for a little while.</small>
              </div>
            </div>
            <label><span>Browser tab icon URL</span><input value={content.faviconUrl} onChange={(event) => update("faviconUrl", event.target.value)} placeholder="/brand/olivelinkit-bubble-logo.png" /></label>
            <label className="full"><span>Upload browser tab icon</span><input accept="image/webp,image/jpeg,image/png" disabled={isUploadingFavicon} onChange={(event) => { void uploadFaviconImage(event.target.files?.[0]); event.currentTarget.value = ""; }} type="file" /></label>
            <div className="content-field-group full">
              <strong>Quick browser tab choices</strong>
              <div className="inline-button-row">
                <button className="table-link table-button" onClick={() => update("faviconUrl", content.logoUrl || defaultWebsiteContent.logoUrl)} type="button">Use current logo</button>
                <button className="table-link table-button" onClick={() => update("faviconUrl", "/brand/olivelinkit-bubble-logo.png")} type="button">Bubble mark</button>
                <button className="table-link table-button" onClick={() => update("faviconUrl", "/brand/olivelinkit-palestine-map-logo-mark.png")} type="button">Palestine mark</button>
              </div>
            </div>
            <div className="content-field-group full"><strong>Header display</strong></div>
            <label>
              <span>Header brand text</span>
              <select value={content.showBrandText ? "show" : "hide"} onChange={(event) => update("showBrandText", event.target.value === "show")}>
                <option value="show">Show text beside logo</option>
                <option value="hide">Logo only</option>
              </select>
            </label>
            <label><span>Header button</span><input value={content.headerCta} onChange={(event) => update("headerCta", event.target.value)} /></label>
          </article>
        )}

        {activeTab === "hero" && (
          <article className="content-editor-card">
            <header><span>First screen</span><h2>Hero message and image</h2></header>
            <label><span>Hero eyebrow</span><input value={content.heroEyebrow} onChange={(event) => update("heroEyebrow", event.target.value)} /></label>
            <label><span>Hero title</span><input value={content.heroTitle} onChange={(event) => update("heroTitle", event.target.value)} /></label>
            <label><span>Hero accent</span><input value={content.heroAccent} onChange={(event) => update("heroAccent", event.target.value)} /></label>
            <label><span>Hero image URL</span><input value={content.heroImageUrl} onChange={(event) => update("heroImageUrl", event.target.value)} placeholder="/hero-it-support.webp" /></label>
            <label className="full"><span>Upload hero image</span><input accept="image/webp,image/jpeg,image/png" disabled={isUploadingHero} onChange={(event) => { void uploadHeroImage(event.target.files?.[0]); event.currentTarget.value = ""; }} type="file" /></label>
            <label className="full"><span>Hero lead</span><textarea rows={4} value={content.heroLead} onChange={(event) => update("heroLead", event.target.value)} /></label>
            <label><span>Primary action</span><input value={content.heroPrimaryCta} onChange={(event) => update("heroPrimaryCta", event.target.value)} /></label>
            <label><span>Secondary action</span><input value={content.heroSecondaryCta} onChange={(event) => update("heroSecondaryCta", event.target.value)} /></label>
            <label className="full"><span>Trust items, one per line</span><textarea rows={4} value={lines(content.trustItems)} onChange={(event) => update("trustItems", fromLines(event.target.value))} /></label>
          </article>
        )}

        {activeTab === "theme" && (
          <article className="content-editor-card">
            <header><span>Site appearance</span><h2>Theme</h2></header>
            <div className="theme-preset-grid full">
              {Object.entries(websiteThemePresets).map(([preset, presetTheme]) => (
                <button className={theme.preset === preset ? "active" : ""} key={preset} onClick={() => applyThemePreset(preset as Exclude<WebsiteTheme["preset"], "custom">)} type="button">
                  <span>{preset}</span>
                  <i style={{ background: presetTheme.primaryColor }} />
                  <i style={{ background: presetTheme.secondaryColor }} />
                  <i style={{ background: presetTheme.accentColor }} />
                </button>
              ))}
            </div>
            <label><span>Primary button color</span><input type="color" value={theme.primaryColor} onChange={(event) => updateTheme("primaryColor", event.target.value)} /></label>
            <label><span>Secondary accent color</span><input type="color" value={theme.secondaryColor} onChange={(event) => updateTheme("secondaryColor", event.target.value)} /></label>
            <label><span>Dark panel color</span><input type="color" value={theme.darkColor} onChange={(event) => updateTheme("darkColor", event.target.value)} /></label>
            <label><span>Warm accent color</span><input type="color" value={theme.accentColor} onChange={(event) => updateTheme("accentColor", event.target.value)} /></label>
            <label><span>Success/status color</span><input type="color" value={theme.successColor} onChange={(event) => updateTheme("successColor", event.target.value)} /></label>
            <div
              className="theme-preview full"
              style={{
                "--blue": theme.primaryColor,
                "--teal": theme.secondaryColor,
                "--navy": theme.darkColor,
                "--amber": theme.accentColor,
                "--green": theme.successColor,
              } as CSSProperties}
            >
              <span>Theme preview</span>
              <strong>{content.brandTitle}</strong>
              <div>
                <button className="button" type="button">Primary action</button>
                <button className="button button-ghost" type="button">Secondary action</button>
              </div>
            </div>
          </article>
        )}

        {activeTab === "journey" && (
          <article className="content-editor-card">
            <header><span>Hero support panel</span><h2>Support journey</h2></header>
            <label className="full"><span>Panel label</span><input value={content.processLabel} onChange={(event) => update("processLabel", event.target.value)} /></label>
            {content.processSteps.map((step, index) => (
              <div className="step-editor full" key={index}>
                <label><span>Step number</span><input value={step.number} onChange={(event) => updateStep(index, "number", event.target.value)} /></label>
                <label><span>Step title</span><input value={step.title} onChange={(event) => updateStep(index, "title", event.target.value)} /></label>
                <label className="full"><span>Step text</span><input value={step.text} onChange={(event) => updateStep(index, "text", event.target.value)} /></label>
              </div>
            ))}
            <label><span>Experience number</span><input value={content.experienceValue} onChange={(event) => update("experienceValue", event.target.value)} /></label>
            <label><span>Experience label</span><input value={content.experienceLabel} onChange={(event) => update("experienceLabel", event.target.value)} /></label>
            <div className="content-field-group full"><strong>Request panel</strong></div>
            <label><span>Panel eyebrow</span><input value={content.supportEyebrow} onChange={(event) => update("supportEyebrow", event.target.value)} /></label>
            <label><span>Panel title</span><input value={content.supportTitle} onChange={(event) => update("supportTitle", event.target.value)} /></label>
            <label className="full"><span>Panel text</span><textarea rows={3} value={content.supportText} onChange={(event) => update("supportText", event.target.value)} /></label>
            <label className="full"><span>Panel points, one per line</span><textarea rows={3} value={lines(content.supportPoints)} onChange={(event) => update("supportPoints", fromLines(event.target.value))} /></label>
          </article>
        )}

        {activeTab === "sections" && (
          <article className="content-editor-card">
            <header><span>Homepage bands</span><h2>Page sections</h2><Link href="/admin/site-services">Edit service cards</Link></header>
            <div className="content-field-group full"><strong>Services</strong></div>
            <label><span>Services eyebrow</span><input value={content.servicesEyebrow} onChange={(event) => update("servicesEyebrow", event.target.value)} /></label>
            <label><span>Services title</span><input value={content.servicesTitle} onChange={(event) => update("servicesTitle", event.target.value)} /></label>
            <label className="full"><span>Services text</span><textarea rows={3} value={content.servicesText} onChange={(event) => update("servicesText", event.target.value)} /></label>
            <div className="content-field-group full"><strong>Service highlights</strong></div>
            {content.serviceHighlights.map((highlight, index) => (
              <div className="step-editor full" key={index}>
                <label><span>Highlight title</span><input value={highlight.title} onChange={(event) => updateHighlight(index, "title", event.target.value)} /></label>
                <label className="full"><span>Highlight text</span><input value={highlight.text} onChange={(event) => updateHighlight(index, "text", event.target.value)} /></label>
              </div>
            ))}
            <div className="content-field-group full"><strong>Approved customer feedback</strong><button className="table-link table-button" onClick={addTestimonial} type="button">Add feedback</button></div>
            <label><span>Feedback eyebrow</span><input value={content.testimonialEyebrow} onChange={(event) => update("testimonialEyebrow", event.target.value)} /></label>
            <label><span>Feedback heading</span><input value={content.testimonialTitle} onChange={(event) => update("testimonialTitle", event.target.value)} /></label>
            <label className="full"><span>Feedback introduction</span><textarea rows={3} value={content.testimonialText} onChange={(event) => update("testimonialText", event.target.value)} /></label>
            {content.testimonials.map((testimonial, index) => (
              <div className="step-editor full" key={index}>
                <label><span>Customer name</span><input value={testimonial.name} onChange={(event) => updateTestimonial(index, "name", event.target.value)} /></label>
                <label><span>Customer context</span><input value={testimonial.context} onChange={(event) => updateTestimonial(index, "context", event.target.value)} placeholder="e.g. Business IT support" /></label>
                <label className="full"><span>Feedback</span><textarea rows={3} value={testimonial.quote} onChange={(event) => updateTestimonial(index, "quote", event.target.value)} /></label>
                <button className="table-link table-button" onClick={() => removeTestimonial(index)} type="button">Remove feedback</button>
              </div>
            ))}
            <div className="content-field-group full"><strong>Who we help</strong></div>
            <label><span>Audience eyebrow</span><input value={content.audienceEyebrow} onChange={(event) => update("audienceEyebrow", event.target.value)} /></label>
            <label><span>Audience title</span><input value={content.audienceTitle} onChange={(event) => update("audienceTitle", event.target.value)} /></label>
            <label className="full"><span>Audience text</span><textarea rows={3} value={content.audienceText} onChange={(event) => update("audienceText", event.target.value)} /></label>
            {content.audienceItems.map((audience, index) => (
              <div className="step-editor full audience-editor" key={index}>
                <label><span>Audience</span><input value={audience.title} onChange={(event) => updateAudience(index, "title", event.target.value)} /></label>
                <label className="full"><span>Focus</span><textarea rows={3} value={audience.text} onChange={(event) => updateAudience(index, "text", event.target.value)} /></label>
              </div>
            ))}
            <div className="content-field-group full"><strong>Why us</strong></div>
            <label><span>About eyebrow</span><input value={content.aboutEyebrow} onChange={(event) => update("aboutEyebrow", event.target.value)} /></label>
            <label><span>About title</span><input value={content.aboutTitle} onChange={(event) => update("aboutTitle", event.target.value)} /></label>
            <label className="full"><span>About text</span><textarea rows={4} value={content.aboutText} onChange={(event) => update("aboutText", event.target.value)} /></label>
            <label><span>Audience proof title</span><input value={content.aboutAudienceTitle} onChange={(event) => update("aboutAudienceTitle", event.target.value)} /></label>
            <label><span>Audience proof text</span><input value={content.aboutAudienceText} onChange={(event) => update("aboutAudienceText", event.target.value)} /></label>
            <label className="full"><span>Skill list, one per line</span><textarea rows={5} value={lines(content.skills)} onChange={(event) => update("skills", fromLines(event.target.value))} /></label>
            <div className="content-field-group full"><strong>Equipment</strong><Link href="/admin/equipment">Manage equipment</Link></div>
            <label><span>Equipment eyebrow</span><input value={content.equipmentEyebrow} onChange={(event) => update("equipmentEyebrow", event.target.value)} /></label>
            <label><span>Equipment title</span><input value={content.equipmentTitle} onChange={(event) => update("equipmentTitle", event.target.value)} /></label>
            <label className="full"><span>Equipment text</span><textarea rows={3} value={content.equipmentText} onChange={(event) => update("equipmentText", event.target.value)} /></label>
            <div className="content-field-group full"><strong>IT planning callout</strong></div>
            <label><span>Callout eyebrow</span><input value={content.consultingEyebrow} onChange={(event) => update("consultingEyebrow", event.target.value)} /></label>
            <label><span>Callout title</span><input value={content.consultingTitle} onChange={(event) => update("consultingTitle", event.target.value)} /></label>
            <label className="full"><span>Callout text</span><textarea rows={4} value={content.consultingText} onChange={(event) => update("consultingText", event.target.value)} /></label>
            <label><span>Callout button</span><input value={content.consultingCta} onChange={(event) => update("consultingCta", event.target.value)} /></label>
          </article>
        )}

        {activeTab === "contact" && (
          <article className="content-editor-card">
            <header><span>Customer contact</span><h2>Contact and footer</h2></header>
            <label><span>Contact eyebrow</span><input value={content.contactEyebrow} onChange={(event) => update("contactEyebrow", event.target.value)} /></label>
            <label><span>Contact title</span><input value={content.contactTitle} onChange={(event) => update("contactTitle", event.target.value)} /></label>
            <label className="full"><span>Contact text</span><textarea rows={3} value={content.contactText} onChange={(event) => update("contactText", event.target.value)} /></label>
            <label><span>Contact button</span><input value={content.contactButton} onChange={(event) => update("contactButton", event.target.value)} /></label>
            <label><span>Support email</span><input type="email" value={content.contactEmail} onChange={(event) => update("contactEmail", event.target.value)} /></label>
            <label><span>WhatsApp number</span><input inputMode="tel" value={content.whatsappNumber} onChange={(event) => update("whatsappNumber", event.target.value)} /></label>
            <label><span>Location text</span><input value={content.locationText} onChange={(event) => update("locationText", event.target.value)} /></label>
            <label><span>Public availability</span><input value={content.businessHours} onChange={(event) => update("businessHours", event.target.value)} /></label>
            <label><span>Response expectation</span><input value={content.responseExpectation} onChange={(event) => update("responseExpectation", event.target.value)} /></label>
            <label className="full"><span>Footer text</span><input value={content.footerText} onChange={(event) => update("footerText", event.target.value)} /></label>
          </article>
        )}

        {activeTab === "legal" && (
          <article className="content-editor-card">
            <header><span>Invoices and receipts</span><h2>Invoice and legal details</h2></header>
            <label><span>Legal business name</span><input value={content.businessLegalName} onChange={(event) => update("businessLegalName", event.target.value)} /></label>
            <label><span>ABN</span><input value={content.businessAbn} onChange={(event) => update("businessAbn", event.target.value)} placeholder="e.g. 12 345 678 901" /></label>
            <label className="full"><span>Business address</span><textarea rows={3} value={content.businessAddress} onChange={(event) => update("businessAddress", event.target.value)} /></label>
            <label><span>Business phone</span><input inputMode="tel" value={content.businessPhone} onChange={(event) => update("businessPhone", event.target.value)} /></label>
            <label><span>Invoice email</span><input type="email" value={content.invoiceEmail} onChange={(event) => update("invoiceEmail", event.target.value)} /></label>
            <label>
              <span>Invoice type</span>
              <select value={content.invoiceIsTaxInvoice ? "tax" : "regular"} onChange={(event) => update("invoiceIsTaxInvoice", event.target.value === "tax")}>
                <option value="tax">Tax invoice, GST shown</option>
                <option value="regular">Regular invoice</option>
              </select>
            </label>
            <label className="full"><span>Payment instructions</span><textarea rows={3} value={content.invoicePaymentInstructions} onChange={(event) => update("invoicePaymentInstructions", event.target.value)} /></label>
            <label className="full"><span>Invoice footer note</span><input value={content.invoiceFooterNote} onChange={(event) => update("invoiceFooterNote", event.target.value)} /></label>
          </article>
        )}
      </div>
    </section>
  );
}
