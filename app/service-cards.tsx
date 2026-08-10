"use client";

import { useEffect, useState } from "react";
import { ServiceIcon } from "./service-icon";
import { defaultWebsiteServices, type WebsiteService } from "./website-services-data";
import { hasStoredWebsiteServices, readWebsiteServices } from "./website-services-store";

type ServiceCardsProps = {
  initialServices?: WebsiteService[];
};

export function ServiceCards({ initialServices = defaultWebsiteServices }: ServiceCardsProps) {
  const [services, setServices] = useState<WebsiteService[]>(initialServices);

  useEffect(() => {
    let active = true;
    async function refresh() {
      if (hasStoredWebsiteServices()) {
        if (active) setServices(readWebsiteServices());
        return;
      }

      try {
        const response = await fetch("/api/site-data", { cache: "no-store" });
        if (!response.ok) throw new Error("Site data unavailable.");
        const payload = await response.json() as { services?: WebsiteService[] };
        if (active && Array.isArray(payload.services)) setServices(payload.services);
      } catch {
        if (active) setServices(readWebsiteServices());
      }
    }

    void refresh();
    window.addEventListener("website-services-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("website-services-updated", refresh);
    };
  }, []);

  return (
    <div className="service-grid">
      {services.map((service, index) => {
        const href = `/?${new URLSearchParams({ requestType: service.requestType, service: service.title }).toString()}#support-assistant`;
        return (
          <article className="service-card" key={service.id}>
            <div className="service-card-top">
              <span className="service-icon"><ServiceIcon icon={service.icon} /></span>
              <span className="service-index">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
            <a href={href}>Ask about this service <span aria-hidden="true">-&gt;</span></a>
          </article>
        );
      })}
    </div>
  );
}
