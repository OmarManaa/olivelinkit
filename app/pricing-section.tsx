"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultWebsitePricing, pricingItemsForDisplay, type WebsitePricingContent, type WebsitePricingItem } from "./website-pricing-data";
import { hasStoredWebsitePricing, readWebsitePricing } from "./website-pricing-store";

type PricingSectionProps = {
  initialPricing?: WebsitePricingContent;
  headingLevel?: "h1" | "h2";
  mode?: "home" | "full";
};

function requestHref(item: WebsitePricingItem) {
  return `/?${new URLSearchParams({ requestType: item.requestType, service: item.title }).toString()}#support-assistant`;
}

export function PricingSection({ headingLevel = "h2", initialPricing = defaultWebsitePricing, mode = "full" }: PricingSectionProps) {
  const Heading = headingLevel;
  const [pricing, setPricing] = useState<WebsitePricingContent>(initialPricing);
  const visible = useMemo(() => {
    const placement = mode === "home" ? "home" : "pricing-page";
    const items = pricingItemsForDisplay(pricing, placement);
    return mode === "home" ? items.slice(0, 8) : items;
  }, [mode, pricing]);

  useEffect(() => {
    let active = true;
    async function refresh() {
      if (hasStoredWebsitePricing()) {
        if (active) setPricing(readWebsitePricing());
        return;
      }

      try {
        const response = await fetch("/api/site-data", { cache: "no-store" });
        if (!response.ok) throw new Error("Site data unavailable.");
        const payload = await response.json() as { pricing?: WebsitePricingContent };
        if (active && payload.pricing) setPricing(payload.pricing);
      } catch {
        if (active) setPricing(readWebsitePricing());
      }
    }

    void refresh();
    window.addEventListener("website-pricing-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("website-pricing-updated", refresh);
    };
  }, []);

  if (visible.length === 0) return null;

  return (
    <section className={`pricing-section ${mode === "home" ? "pricing-preview" : "pricing-full"}`} id="pricing">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{pricing.eyebrow}</p>
          <Heading>{pricing.title}</Heading>
        </div>
        <p>{pricing.intro}</p>
      </div>
      {mode === "home" ? (
        <>
          <div className="pricing-list pricing-preview-list">
            {visible.map((item) => (
              <article className={`pricing-card ${item.featured ? "pricing-card-featured" : ""}`} key={item.id}>
                <div className="pricing-card-head">
                  <h4>{item.title}</h4>
                  <strong>{item.price}</strong>
                </div>
                {item.featured && <span className="pricing-featured">Common request</span>}
                <p>{item.description}</p>
                <div className="pricing-meta">
                  <span>{item.turnaround}</span>
                  <a href={requestHref(item)}>Request this service <span aria-hidden="true">-&gt;</span></a>
                </div>
              </article>
            ))}
          </div>
          <div className="pricing-section-actions">
            <a className="button" href="/pricing">View all pricing</a>
            <a className="button button-ghost" href="#support-assistant">Ask for a quote</a>
          </div>
          <p className="pricing-disclaimer pricing-preview-note">Indicative prices for standard work. Full inclusions, exclusions, and data recovery notes are on the pricing page.</p>
        </>
      ) : (
        <div className="pricing-board">
          {pricing.groups.map((group) => {
            const groupItems = visible.filter((item) => item.groupId === group.id);
            if (groupItems.length === 0) return null;
            return (
              <section className="pricing-group" key={group.id} aria-labelledby={`pricing-${group.id}`}>
                <header>
                  <div>
                    <h3 id={`pricing-${group.id}`}>{group.title}</h3>
                    <p>{group.summary}</p>
                  </div>
                  <span>{groupItems.length} option{groupItems.length === 1 ? "" : "s"}</span>
                </header>
                <div className="pricing-list">
                  {groupItems.map((item) => (
                    <article className={`pricing-card ${item.featured ? "pricing-card-featured" : ""}`} key={item.id}>
                      <div className="pricing-card-head">
                        <h4>{item.title}</h4>
                        <strong>{item.price}</strong>
                      </div>
                      {item.featured && <span className="pricing-featured">Common request</span>}
                      <p>{item.description}</p>
                      <ul>
                        {item.scope.map((scopeItem) => <li key={scopeItem}>{scopeItem}</li>)}
                      </ul>
                      <div className="pricing-meta">
                        <span>{item.turnaround}</span>
                        <a href={requestHref(item)}>Request this service <span aria-hidden="true">-&gt;</span></a>
                      </div>
                      {item.finePrint && <small>{item.finePrint}</small>}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
      {mode === "full" && <p className="pricing-disclaimer">{pricing.disclaimer}</p>}
    </section>
  );
}
