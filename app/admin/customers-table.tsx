"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Customer } from "./admin-data";
import { readProspects } from "./prospects-store";

type CustomersTableProps = {
  customers: Customer[];
};

export function CustomersTable({ customers }: CustomersTableProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [priority, setPriority] = useState("all");
  const [prospects, setProspects] = useState<Customer[]>([]);

  useEffect(() => {
    const refresh = () => setProspects(readProspects());
    refresh();
    window.addEventListener("prospects-updated", refresh);
    window.addEventListener("quote-drafts-updated", refresh);
    return () => {
      window.removeEventListener("prospects-updated", refresh);
      window.removeEventListener("quote-drafts-updated", refresh);
    };
  }, []);

  const allCustomers = useMemo(() => [...prospects, ...customers], [customers, prospects]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allCustomers.filter((customer) => {
      const matchesQuery = !needle || [customer.name, customer.email, customer.phone, customer.devices, customer.status].some((value) => value.toLowerCase().includes(needle));
      const matchesType = type === "all" || customer.type === type;
      const matchesPriority = priority === "all" || customer.priority === priority;
      return matchesQuery && matchesType && matchesPriority;
    });
  }, [allCustomers, priority, query, type]);

  return (
    <section className="work-panel">
      <div className="work-toolbar customers-toolbar">
        <label className="search-field">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, email, phone, device, status" />
        </label>
        <label>
          <span>Type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">All types</option>
            <option value="Home">Home</option>
            <option value="Business">Business</option>
            <option value="Prospect">Prospect</option>
          </select>
        </label>
        <label>
          <span>Priority</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="all">All priorities</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
        </label>
      </div>
      <div className="table-summary">
        <strong>{filtered.length}</strong> shown from {allCustomers.length} records
        <span>{prospects.length} prospects</span>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Devices</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Last activity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id}>
                <td><strong>{customer.name}</strong><small>{customer.id}</small></td>
                <td>{customer.type}</td>
                <td><strong>{customer.email}</strong><small>{customer.phone}</small></td>
                <td>{customer.devices}</td>
                <td>{customer.status}</td>
                <td><span className={customer.priority === "High" ? "stock-low" : ""}>{customer.priority}</span></td>
                <td>{customer.lastActivity}</td>
                <td><Link className="table-link" href={customer.type === "Prospect" ? `/admin/quotes/new?customer=${encodeURIComponent(customer.name)}&requestId=${encodeURIComponent(customer.status)}` : `/admin/customers/${customer.id}/edit`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty-note">No customers match the current filters.</div>}
    </section>
  );
}
