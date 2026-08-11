"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultWebsitePricing, type WebsitePricingContent, type WebsitePricingItem } from "./website-pricing-data";
import { hasStoredWebsitePricing, readWebsitePricing } from "./website-pricing-store";

type PricingSectionProps = {
  initialPricing?: WebsitePricingContent;
};

function requestHref(item: WebsitePricingItem) {
  return `/?${new URLSearchParams({ requestType: item.requestType, service: item.title }).toString()}#support-assistant`;
}

function visibleItems(pricing: WebsitePricingContent) {
  return pricing.items.filter((item) => item.visible);
}

export function PricingSection({ initialPricing = defaultWebsitePricing }: PricingSectionProps) {
  const [pricing, setPricing] = useState<WebsitePricingContent>(initialPricing);
  const visible = useMemo(() => visibleItems(pricing), [pricing]);

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
    <section className="pricing-section" id="pricing">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{pricing.eyebrow}</p>
          <h2>{pricing.title}</h2>
        </div>
        <p>{pricing.intro}</p>
      </div>
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
                  <article className="pricing-card" key={item.id}>
                    <div className="pricing-card-head">
                      <h4>{item.title}</h4>
                      <strong>{item.price}</strong>
                    </div>
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
      <p className="pricing-disclaimer">{pricing.disclaimer}</p>
    </section>
  );
}
