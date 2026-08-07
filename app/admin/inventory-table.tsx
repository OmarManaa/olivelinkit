"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { InventoryItem } from "./admin-data";
import { readInventoryItems } from "../inventory-store";

type InventoryTableProps = {
  items: InventoryItem[];
  mode: "inventory" | "equipment";
};

export function InventoryTable({ items, mode }: InventoryTableProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("all");
  const [allItems, setAllItems] = useState<InventoryItem[]>(items);

  useEffect(() => {
    const refresh = () => setAllItems(readInventoryItems());
    refresh();
    window.addEventListener("inventory-items-updated", refresh);
    return () => window.removeEventListener("inventory-items-updated", refresh);
  }, []);

  const visibleItems = useMemo(() => {
    return mode === "equipment" ? allItems.filter((item) => item.type === "Equipment") : allItems;
  }, [allItems, mode]);

  const categories = useMemo(() => {
    return Array.from(new Set(visibleItems.map((item) => item.category))).sort();
  }, [visibleItems]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return visibleItems.filter((item) => {
      const matchesQuery = !needle || [item.sku, item.name, item.category, item.condition].some((value) => value.toLowerCase().includes(needle));
      const matchesCategory = category === "all" || item.category === category;
      const isLow = item.quantity <= item.reorderLevel;
      const matchesStock = stock === "all" || (stock === "low" ? isLow : !isLow);
      return matchesQuery && matchesCategory && matchesStock;
    });
  }, [category, query, stock, visibleItems]);

  const lowStockCount = visibleItems.filter((item) => item.quantity <= item.reorderLevel).length;

  return (
    <section className="work-panel">
      <div className="work-toolbar">
        <label className="search-field">
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search SKU, item, category, condition" />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>Stock</span>
          <select value={stock} onChange={(event) => setStock(event.target.value)}>
            <option value="all">All stock</option>
            <option value="low">Low stock</option>
            <option value="healthy">Healthy stock</option>
          </select>
        </label>
      </div>
      <div className="table-summary">
        <strong>{filtered.length}</strong> shown from {visibleItems.length} records
        <span>{lowStockCount} low-stock alerts</span>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Reorder</th>
              <th>Condition</th>
              <th>Price</th>
              <th>Public</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isLow = item.quantity <= item.reorderLevel;
              return (
                <tr key={item.sku}>
                  <td>
                    <div className="inventory-item-cell">
                      {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" decoding="async" />}
                      <span><strong>{item.name}</strong><small>{item.sku}</small></span>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td><span className={isLow ? "stock-low" : ""}>{item.quantity}</span></td>
                  <td>{item.reorderLevel}</td>
                  <td>{item.condition}</td>
                  <td>${item.salePrice}</td>
                  <td>{item.publicVisible ? "Yes" : "No"}</td>
                  <td>{item.updatedAt}</td>
                  <td><Link className="table-link" href={`/admin/${mode}/${encodeURIComponent(item.sku)}/edit`}>Edit</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty-note">No records match the current filters.</div>}
    </section>
  );
}
