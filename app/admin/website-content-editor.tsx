"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultWebsiteContent, type WebsiteContent } from "../website-content-data";
import { readWebsiteContent, resetWebsiteContent, saveWebsiteContent } from "../website-content-store";

function lines(value: string[]) {
  return value.join("\n");
}

function fromLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function WebsiteContentEditor() {
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    setContent(readWebsiteContent());
  }, []);

  function update(field: keyof WebsiteContent, value: string | string[]) {
    setContent((current) => ({ ...current, [field]: value }));
  }

  function updateStep(index: number, field: "title" | "text" | "number", value: string) {
    setContent((current) => ({
      ...current,
      processSteps: current.processSteps.map((step, stepIndex) => stepIndex === index ? { ...step, [field]: value } : step),
    }));
  }

  function save() {
    saveWebsiteContent(content);
    setSaved("Website content saved. Refresh the public website to see it live.");
  }

  function reset() {
    resetWebsiteContent();
    setContent(defaultWebsiteContent);
    setSaved("Website content reset to defaults.");
  }

  return (
    <section className="content-editor">
      <div className="editor-actions">
        <Link className="button button-ghost" href="/">Preview website</Link>
        <button className="button button-ghost" onClick={reset} type="button">Reset defaults</button>
        <button className="button" onClick={save} type="button">Save website content</button>
      </div>
      {saved && <div className="assistant-saved">{saved}</div>}

      <article className="content-editor-card">
        <h2>Header and hero</h2>
        <label><span>Brand title</span><input value={content.brandTitle} onChange={(event) => update("brandTitle", event.target.value)} /></label>
        <label><span>Brand subtitle</span><input value={content.brandSubtitle} onChange={(event) => update("brandSubtitle", event.target.value)} /></label>
        <label><span>Header button</span><input value={content.headerCta} onChange={(event) => update("headerCta", event.target.value)} /></label>
        <label><span>Hero eyebrow</span><input value={content.heroEyebrow} onChange={(event) => update("heroEyebrow", event.target.value)} /></label>
        <label><span>Hero title</span><input value={content.heroTitle} onChange={(event) => update("heroTitle", event.target.value)} /></label>
        <label><span>Hero accent</span><input value={content.heroAccent} onChange={(event) => update("heroAccent", event.target.value)} /></label>
        <label className="full"><span>Hero lead</span><textarea rows={4} value={content.heroLead} onChange={(event) => update("heroLead", event.target.value)} /></label>
        <label><span>Primary CTA</span><input value={content.heroPrimaryCta} onChange={(event) => update("heroPrimaryCta", event.target.value)} /></label>
        <label><span>Secondary CTA</span><input value={content.heroSecondaryCta} onChange={(event) => update("heroSecondaryCta", event.target.value)} /></label>
        <label className="full"><span>Trust items, one per line</span><textarea rows={3} value={lines(content.trustItems)} onChange={(event) => update("trustItems", fromLines(event.target.value))} /></label>
      </article>

      <article className="content-editor-card">
        <h2>Process panel</h2>
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
      </article>

      <article className="content-editor-card">
        <h2>Sections</h2>
        <label><span>Services eyebrow</span><input value={content.servicesEyebrow} onChange={(event) => update("servicesEyebrow", event.target.value)} /></label>
        <label><span>Services title</span><input value={content.servicesTitle} onChange={(event) => update("servicesTitle", event.target.value)} /></label>
        <label className="full"><span>Services text</span><textarea rows={3} value={content.servicesText} onChange={(event) => update("servicesText", event.target.value)} /></label>
        <label><span>About eyebrow</span><input value={content.aboutEyebrow} onChange={(event) => update("aboutEyebrow", event.target.value)} /></label>
        <label><span>About title</span><input value={content.aboutTitle} onChange={(event) => update("aboutTitle", event.target.value)} /></label>
        <label className="full"><span>About text</span><textarea rows={4} value={content.aboutText} onChange={(event) => update("aboutText", event.target.value)} /></label>
        <label className="full"><span>Skill list, one per line</span><textarea rows={5} value={lines(content.skills)} onChange={(event) => update("skills", fromLines(event.target.value))} /></label>
        <label><span>Equipment eyebrow</span><input value={content.equipmentEyebrow} onChange={(event) => update("equipmentEyebrow", event.target.value)} /></label>
        <label><span>Equipment title</span><input value={content.equipmentTitle} onChange={(event) => update("equipmentTitle", event.target.value)} /></label>
        <label className="full"><span>Equipment text</span><textarea rows={3} value={content.equipmentText} onChange={(event) => update("equipmentText", event.target.value)} /></label>
      </article>

      <article className="content-editor-card">
        <h2>Contact and footer</h2>
        <label><span>Contact eyebrow</span><input value={content.contactEyebrow} onChange={(event) => update("contactEyebrow", event.target.value)} /></label>
        <label><span>Contact title</span><input value={content.contactTitle} onChange={(event) => update("contactTitle", event.target.value)} /></label>
        <label className="full"><span>Contact text</span><textarea rows={3} value={content.contactText} onChange={(event) => update("contactText", event.target.value)} /></label>
        <label><span>Contact button</span><input value={content.contactButton} onChange={(event) => update("contactButton", event.target.value)} /></label>
        <label><span>Support email</span><input value={content.contactEmail} onChange={(event) => update("contactEmail", event.target.value)} /></label>
        <label><span>WhatsApp number</span><input value={content.whatsappNumber} onChange={(event) => update("whatsappNumber", event.target.value)} /></label>
        <label><span>Location text</span><input value={content.locationText} onChange={(event) => update("locationText", event.target.value)} /></label>
        <label className="full"><span>Footer text</span><input value={content.footerText} onChange={(event) => update("footerText", event.target.value)} /></label>
      </article>
    </section>
  );
}
