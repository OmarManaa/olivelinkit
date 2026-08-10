"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { customers as seedCustomers, type Customer } from "./admin-data";
import { readCustomerRecords, saveCustomerRecord } from "./customers-store";

type CustomerRecordFormProps = {
  customerId?: string;
  initialCustomer?: Customer;
};

function blankCustomer(): Customer {
  return {
    id: "",
    name: "",
    type: "Home",
    email: "",
    phone: "",
    devices: "No devices recorded",
    status: "Active customer",
    priority: "Normal",
    lastActivity: "Just now",
    notes: "",
  };
}

export function CustomerRecordForm({ customerId, initialCustomer }: CustomerRecordFormProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>(initialCustomer ?? blankCustomer());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!customerId) return;
    const timer = window.setTimeout(() => {
      const savedCustomer = readCustomerRecords(seedCustomers).find((record) => record.id === customerId);
      setCustomer(savedCustomer ?? initialCustomer ?? blankCustomer());
    }, 0);
    return () => window.clearTimeout(timer);
  }, [customerId, initialCustomer]);

  function update<Key extends keyof Customer>(field: Key, value: Customer[Key]) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function save() {
    const name = customer.name.trim();
    if (!name) {
      setNotice("Add the customer name before saving.");
      return;
    }
    const record: Customer = {
      ...customer,
      id: customer.id || `CUST-${Date.now().toString().slice(-6)}`,
      name,
      email: customer.email.trim() || "Not captured",
      phone: customer.phone.trim() || "Not captured",
      devices: customer.devices.trim() || "No devices recorded",
      status: customer.status.trim() || "Active customer",
      notes: customer.notes.trim(),
      lastActivity: "Just now",
    };
    saveCustomerRecord(record);
    router.push("/admin/customers");
  }

  return (
    <form className="admin-form quote-form">
      <label>
        <span>Customer ID</span>
        <input readOnly value={customer.id || "Assigned when saved"} />
      </label>
      <label>
        <span>Customer type</span>
        <select onChange={(event) => update("type", event.target.value as Customer["type"])} value={customer.type}>
          <option>Home</option>
          <option>Business</option>
          <option>Prospect</option>
        </select>
      </label>
      <label>
        <span>Name</span>
        <input autoComplete="name" onChange={(event) => update("name", event.target.value)} value={customer.name} />
      </label>
      <label>
        <span>Email</span>
        <input autoComplete="email" onChange={(event) => update("email", event.target.value)} type="email" value={customer.email === "Not captured" ? "" : customer.email} />
      </label>
      <label>
        <span>Mobile or phone</span>
        <input autoComplete="tel" onChange={(event) => update("phone", event.target.value)} type="tel" value={customer.phone === "Not captured" ? "" : customer.phone} />
      </label>
      <label>
        <span>Priority</span>
        <select onChange={(event) => update("priority", event.target.value as Customer["priority"])} value={customer.priority}>
          <option>Low</option>
          <option>Normal</option>
          <option>High</option>
        </select>
      </label>
      <label>
        <span>Devices</span>
        <input onChange={(event) => update("devices", event.target.value)} value={customer.devices} />
      </label>
      <label>
        <span>Status</span>
        <input onChange={(event) => update("status", event.target.value)} value={customer.status} />
      </label>
      <label className="full">
        <span>Notes</span>
        <textarea onChange={(event) => update("notes", event.target.value)} rows={6} value={customer.notes} />
      </label>
      {notice && <div className="workflow-notice full">{notice}</div>}
      <div className="form-actions">
        <Link className="button button-ghost" href="/admin/customers">Cancel</Link>
        <button className="button" onClick={save} type="button">Save customer</button>
      </div>
    </form>
  );
}
