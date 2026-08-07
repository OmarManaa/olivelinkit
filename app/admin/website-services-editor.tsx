"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ServiceIcon } from "../service-icon";
import { defaultWebsiteServices, serviceIconOptions, type ServiceIconKey, type WebsiteService } from "../website-services-data";
import { readWebsiteServices, resetWebsiteServices, saveWebsiteServices } from "../website-services-store";

const requestTypes = ["Computer repair", "Business IT", "Network or Wi-Fi", "Microsoft 365 or email", "Security", "Remote support", "Quote request", "Equipment enquiry"];

export function WebsiteServicesEditor() {
  const [services, setServices] = useState<WebsiteService[]>(defaultWebsiteServices);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    setServices(readWebsiteServices());
  }, []);

  function updateService(id: string, field: keyof WebsiteService, value: string) {
    setServices((current) => current.map((service) => service.id === id ? { ...service, [field]: value } : service));
  }

  function saveAll() {
    saveWebsiteServices(services);
    setSaved("Service cards saved. Refresh the public website to see the latest cards.");
  }

  function addService() {
    const id = `service-${Date.now().toString().slice(-5)}`;
    setServices((current) => [...current, { id, title: "New service", requestType: "Quote request", text: "Describe the service customers can ask about.", icon: "laptop" }]);
  }

  function removeService(id: string) {
    setServices((current) => current.filter((service) => service.id !== id));
  }

  function resetAll() {
    resetWebsiteServices();
    setServices(defaultWebsiteServices);
    setSaved("Service cards reset to the default website copy.");
  }

  return (
    <section className="services-editor">
      <div className="editor-actions">
        <button className="button button-ghost" onClick={addService} type="button">Add service</button>
        <button className="button button-ghost" onClick={resetAll} type="button">Reset defaults</button>
        <Link className="button button-ghost" href="/#services">Preview website</Link>
        <button className="button" onClick={saveAll} type="button">Save service cards</button>
      </div>
      {saved && <div className="assistant-saved">{saved}</div>}
      <div className="services-editor-grid">
        {services.map((service) => (
          <article className="service-editor-card" key={service.id}>
            <div className="service-editor-preview">
              <span className="service-icon"><ServiceIcon icon={service.icon} /></span>
              <div><strong>{service.title}</strong><small>{service.requestType}</small></div>
            </div>
            <label><span>Card title</span><input value={service.title} onChange={(event) => updateService(service.id, "title", event.target.value)} /></label>
            <label><span>Request type</span><select value={service.requestType} onChange={(event) => updateService(service.id, "requestType", event.target.value)}>{requestTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label><span>Icon</span><select value={service.icon} onChange={(event) => updateService(service.id, "icon", event.target.value as ServiceIconKey)}>{serviceIconOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</select></label>
            <label className="full"><span>Description</span><textarea rows={4} value={service.text} onChange={(event) => updateService(service.id, "text", event.target.value)} /></label>
            <button className="table-link remove-service" onClick={() => removeService(service.id)} type="button">Remove</button>
          </article>
        ))}
      </div>
    </section>
  );
}
