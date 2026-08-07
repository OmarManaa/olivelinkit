"use client";

import { useEffect, useState } from "react";
import { ServiceIcon } from "./service-icon";
import { defaultWebsiteServices, type WebsiteService } from "./website-services-data";
import { readWebsiteServices } from "./website-services-store";

export function ServiceCards() {
  const [services, setServices] = useState<WebsiteService[]>(defaultWebsiteServices);

  useEffect(() => {
    const refresh = () => setServices(readWebsiteServices());
    refresh();
    window.addEventListener("website-services-updated", refresh);
    return () => window.removeEventListener("website-services-updated", refresh);
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
