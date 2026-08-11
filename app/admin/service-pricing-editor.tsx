"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { persistAdminState } from "../persistence-client";
import { defaultWebsitePricing, normalizePricingItem, pricingRequestTypes, sortPricingItems, type WebsitePricingContent, type WebsitePricingGroup, type WebsitePricingItem } from "../website-pricing-data";
import { readWebsitePricing, resetWebsitePricing, saveWebsitePricing } from "../website-pricing-store";

type PricingTab = "copy" | "groups" | "services";

const tabs: { id: PricingTab; label: string }[] = [
  { id: "copy", label: "Section Copy" },
  { id: "groups", label: "Groups" },
  { id: "services", label: "Service Prices" },
];

function lines(value: string[]) {
  return value.join("\n");
}

function fromLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function cleanPricing(pricing: WebsitePricingContent): WebsitePricingContent {
  const groups = pricing.groups.filter((group) => group.title.trim()).map((group) => ({
    ...group,
    title: group.title.trim(),
    summary: group.summary.trim(),
  }));
  const safeGroups = groups.length ? groups : defaultWebsitePricing.groups;
  const safeGroupIds = new Set(safeGroups.map((group) => group.id));
  const fallbackGroupId = safeGroups[0].id;
  return {
    ...pricing,
    eyebrow: pricing.eyebrow.trim() || defaultWebsitePricing.eyebrow,
    title: pricing.title.trim() || defaultWebsitePricing.title,
    intro: pricing.intro.trim() || defaultWebsitePricing.intro,
    disclaimer: pricing.disclaimer.trim() || defaultWebsitePricing.disclaimer,
    groups: safeGroups,
    items: pricing.items.filter((item) => item.title.trim()).map((item, index) => {
      const normalizedItem = normalizePricingItem(item, index);
      return {
        ...normalizedItem,
        groupId: safeGroupIds.has(normalizedItem.groupId) ? normalizedItem.groupId : fallbackGroupId,
        title: normalizedItem.title.trim(),
        requestType: normalizedItem.requestType.trim() || "Quote request",
        price: normalizedItem.price.trim() || "Quote first",
        turnaround: normalizedItem.turnaround.trim() || "By appointment",
        description: normalizedItem.description.trim(),
        scope: normalizedItem.scope.filter((scopeItem) => scopeItem.trim()).map((scopeItem) => scopeItem.trim()),
        finePrint: normalizedItem.finePrint.trim(),
      };
    }),
  };
}

export function ServicePricingEditor() {
  const [pricing, setPricing] = useState<WebsitePricingContent>(defaultWebsitePricing);
  const [activeTab, setActiveTab] = useState<PricingTab>("copy");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const refresh = () => setPricing(readWebsitePricing());
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("website-pricing-updated", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("website-pricing-updated", refresh);
    };
  }, []);

  function updateField(field: keyof WebsitePricingContent, value: string) {
    setPricing((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setSaved("");
  }

  function updateGroup(id: string, field: keyof WebsitePricingGroup, value: string) {
    setPricing((current) => ({
      ...current,
      groups: current.groups.map((group) => group.id === id ? { ...group, [field]: value } : group),
    }));
    setDirty(true);
    setSaved("");
  }

  function addGroup() {
    const id = newId("pricing-group");
    setPricing((current) => ({
      ...current,
      groups: [...current.groups, { id, title: "New pricing group", summary: "Describe the type of work in this group." }],
    }));
    setActiveTab("groups");
    setDirty(true);
    setSaved("");
  }

  function removeGroup(id: string) {
    setPricing((current) => {
      const remainingGroups = current.groups.filter((group) => group.id !== id);
      const fallbackGroupId = remainingGroups[0]?.id ?? defaultWebsitePricing.groups[0].id;
      return {
        ...current,
        groups: remainingGroups.length ? remainingGroups : defaultWebsitePricing.groups,
        items: current.items.map((item) => item.groupId === id ? { ...item, groupId: fallbackGroupId } : item),
      };
    });
    setDirty(true);
    setSaved("");
  }

  function updateItem(id: string, field: keyof WebsitePricingItem, value: string | string[] | boolean | number) {
    setPricing((current) => ({
      ...current,
      items: current.items.map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
    setDirty(true);
    setSaved("");
  }

  function addItem(groupId = pricing.groups[0]?.id ?? defaultWebsitePricing.groups[0].id) {
    const id = newId("pricing");
    setPricing((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id,
          groupId,
          title: "New service price",
          requestType: "Quote request",
          price: "Quote first",
          turnaround: "By appointment",
          description: "Describe the standard service scope.",
          scope: ["Initial assessment", "Quote before extra work"],
          finePrint: "Update any conditions or exclusions before publishing.",
          visible: true,
          showOnHome: false,
          showOnPricingPage: true,
          featured: false,
          sortOrder: (current.items.length + 1) * 10,
        },
      ],
    }));
    setActiveTab("services");
    setDirty(true);
    setSaved("");
  }

  function removeItem(id: string) {
    setPricing((current) => ({ ...current, items: current.items.filter((item) => item.id !== id) }));
    setDirty(true);
    setSaved("");
  }

  async function saveAll() {
    setIsSaving(true);
    const publishedPricing = cleanPricing(pricing);
    saveWebsitePricing(publishedPricing);
    setPricing(publishedPricing);
    setDirty(false);
    const persisted = await persistAdminState("site-pricing", publishedPricing);
    setSaved(persisted.ok ? "Service pricing published." : `Saved in this browser, but not live: ${persisted.error}`);
    setIsSaving(false);
  }

  async function resetAll() {
    if (!window.confirm("Reset service pricing to the default menu? This replaces every unsaved and saved pricing change.")) return;
    resetWebsitePricing();
    await persistAdminState("site-pricing", null);
    setPricing(defaultWebsitePricing);
    setDirty(false);
    setSaved("Service pricing reset to defaults.");
    setActiveTab("copy");
  }

  return (
    <section className="content-editor pricing-editor">
      <header className="content-editor-toolbar">
        <div>
          <span>Service pricing</span>
          <strong>{dirty ? "Unsaved changes" : "All changes saved"}</strong>
        </div>
        <div className="editor-actions">
          <button className="button button-ghost" onClick={addGroup} type="button">Add group</button>
          <button className="button button-ghost" onClick={() => addItem()} type="button">Add service</button>
          <Link className="button button-ghost" href="/#pricing">Preview home</Link>
          <Link className="button button-ghost" href="/pricing">Full pricing</Link>
          <button className="button button-ghost" onClick={() => { void resetAll(); }} type="button">Reset defaults</button>
          <button className="button" disabled={isSaving} onClick={() => { void saveAll(); }} type="button">{isSaving ? "Publishing..." : "Publish pricing"}</button>
        </div>
      </header>
      {saved && <div className="assistant-saved">{saved}</div>}

      <div className="content-editor-tabs" role="tablist" aria-label="Service pricing editor areas">
        {tabs.map((tab) => (
          <button
            aria-controls={`pricing-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? "active" : ""}
            id={`pricing-tab-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div aria-labelledby={`pricing-tab-${activeTab}`} className="content-editor-panel" id={`pricing-panel-${activeTab}`} role="tabpanel">
        {activeTab === "copy" && (
          <article className="content-editor-card">
            <header><span>Public pricing section</span><h2>Heading and guidance</h2></header>
            <label><span>Eyebrow</span><input value={pricing.eyebrow} onChange={(event) => updateField("eyebrow", event.target.value)} /></label>
            <label><span>Title</span><input value={pricing.title} onChange={(event) => updateField("title", event.target.value)} /></label>
            <label className="full"><span>Intro text</span><textarea rows={4} value={pricing.intro} onChange={(event) => updateField("intro", event.target.value)} /></label>
            <label className="full"><span>Pricing disclaimer</span><textarea rows={4} value={pricing.disclaimer} onChange={(event) => updateField("disclaimer", event.target.value)} /></label>
          </article>
        )}

        {activeTab === "groups" && (
          <article className="content-editor-card">
            <header><span>Pricing groups</span><h2>How services are organised</h2></header>
            {pricing.groups.map((group) => (
              <div className="pricing-group-editor full" key={group.id}>
                <label><span>Group title</span><input value={group.title} onChange={(event) => updateGroup(group.id, "title", event.target.value)} /></label>
                <label><span>Summary</span><input value={group.summary} onChange={(event) => updateGroup(group.id, "summary", event.target.value)} /></label>
                <button className="table-link table-button" disabled={pricing.groups.length === 1} onClick={() => removeGroup(group.id)} type="button">Remove group</button>
              </div>
            ))}
          </article>
        )}

        {activeTab === "services" && (
          <div className="pricing-service-groups">
            <div className="pricing-editor-note">
              Home preview shows only services marked Home preview, ordered by Display order, with the first eight shown on the homepage.
            </div>
            {pricing.groups.map((group) => {
              const groupItems = sortPricingItems(pricing.items).filter((item) => item.groupId === group.id);
              return (
                <section className="pricing-service-group" key={group.id}>
                  <header>
                    <div><span>{group.title}</span><strong>{groupItems.length} service{groupItems.length === 1 ? "" : "s"}</strong></div>
                    <button className="table-link table-button" onClick={() => addItem(group.id)} type="button">Add service here</button>
                  </header>
                  <div className="pricing-service-editor-grid">
                    {groupItems.map((item) => (
                      <article className="pricing-item-editor" key={item.id}>
                        <div className="pricing-item-editor-head">
                          <div className="pricing-item-editor-flags" aria-label={`${item.title} publishing controls`}>
                            <label className="pricing-visible-toggle">
                              <input checked={item.visible !== false} onChange={(event) => updateItem(item.id, "visible", event.target.checked)} type="checkbox" />
                              <span>Listed</span>
                            </label>
                            <label className="pricing-visible-toggle">
                              <input checked={item.showOnHome === true} onChange={(event) => updateItem(item.id, "showOnHome", event.target.checked)} type="checkbox" />
                              <span>Home preview</span>
                            </label>
                            <label className="pricing-visible-toggle">
                              <input checked={item.showOnPricingPage !== false} onChange={(event) => updateItem(item.id, "showOnPricingPage", event.target.checked)} type="checkbox" />
                              <span>Full page</span>
                            </label>
                            <label className="pricing-visible-toggle">
                              <input checked={item.featured === true} onChange={(event) => updateItem(item.id, "featured", event.target.checked)} type="checkbox" />
                              <span>Featured</span>
                            </label>
                          </div>
                          <button className="table-link table-button" onClick={() => removeItem(item.id)} type="button">Remove</button>
                        </div>
                        <label><span>Service title</span><input value={item.title} onChange={(event) => updateItem(item.id, "title", event.target.value)} /></label>
                        <label><span>Price or range</span><input value={item.price} onChange={(event) => updateItem(item.id, "price", event.target.value)} placeholder="$149 - $249" /></label>
                        <label><span>Group</span><select value={item.groupId} onChange={(event) => updateItem(item.id, "groupId", event.target.value)}>{pricing.groups.map((option) => <option key={option.id} value={option.id}>{option.title}</option>)}</select></label>
                        <label><span>Request type</span><select value={item.requestType} onChange={(event) => updateItem(item.id, "requestType", event.target.value)}>{pricingRequestTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                        <label><span>Display order</span><input min="0" step="10" type="number" value={item.sortOrder ?? 0} onChange={(event) => updateItem(item.id, "sortOrder", Number(event.target.value))} /></label>
                        <label><span>Turnaround</span><input value={item.turnaround} onChange={(event) => updateItem(item.id, "turnaround", event.target.value)} /></label>
                        <label className="full"><span>Description</span><textarea rows={3} value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} /></label>
                        <label className="full"><span>Included scope, one per line</span><textarea rows={4} value={lines(item.scope)} onChange={(event) => updateItem(item.id, "scope", fromLines(event.target.value))} /></label>
                        <label className="full"><span>Conditions or exclusions</span><textarea rows={3} value={item.finePrint} onChange={(event) => updateItem(item.id, "finePrint", event.target.value)} /></label>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
