import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["home", "business"] }).notNull().default("home"),
  name: text("name").notNull(), businessName: text("business_name"), email: text("email"), phone: text("phone"), address: text("address"), notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
export const devices = sqliteTable("devices", {
  id: integer("id").primaryKey({ autoIncrement: true }), customerId: integer("customer_id").notNull().references(()=>customers.id), type: text("type").notNull(), brand: text("brand"), model: text("model"), serialNumber: text("serial_number"), specifications: text("specifications"), notes: text("notes"), createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }), reference: text("reference").notNull().unique(), customerId: integer("customer_id").notNull().references(()=>customers.id), deviceId: integer("device_id").references(()=>devices.id), title: text("title").notNull(), description: text("description"), diagnosis: text("diagnosis"), resolution: text("resolution"), status: text("status").notNull().default("new"), priority: text("priority").notNull().default("normal"), serviceType: text("service_type"), scheduledAt: integer("scheduled_at", { mode: "timestamp" }), completedAt: integer("completed_at", { mode: "timestamp" }), createdAt: integer("created_at", { mode: "timestamp" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
export const inventory = sqliteTable("inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }), sku: text("sku").notNull().unique(), name: text("name").notNull(), category: text("category"), description: text("description"), specs: text("specs"), condition: text("condition"), quantity: integer("quantity").notNull().default(0), reorderLevel: integer("reorder_level").notNull().default(0), cost: real("cost"), salePrice: real("sale_price"), warranty: text("warranty"), publicVisible: integer("public_visible", { mode: "boolean" }).notNull().default(false), createdAt: integer("created_at", { mode: "timestamp" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }), reference: text("reference").notNull().unique(), customerId: integer("customer_id").notNull().references(()=>customers.id), jobId: integer("job_id").references(()=>jobs.id), status: text("status").notNull().default("draft"), subtotal: real("subtotal").notNull().default(0), gst: real("gst").notNull().default(0), total: real("total").notNull().default(0), expiresAt: integer("expires_at", { mode: "timestamp" }), notes: text("notes"), createdAt: integer("created_at", { mode: "timestamp" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
export const quoteItems = sqliteTable("quote_items", {
  id: integer("id").primaryKey({ autoIncrement: true }), quoteId: integer("quote_id").notNull().references(()=>quotes.id), inventoryId: integer("inventory_id").references(()=>inventory.id), description: text("description").notNull(), quantity: real("quantity").notNull().default(1), unitPrice: real("unit_price").notNull().default(0), lineTotal: real("line_total").notNull().default(0),
});
export const jobNotes = sqliteTable("job_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }), jobId: integer("job_id").notNull().references(()=>jobs.id), note: text("note").notNull(), customerVisible: integer("customer_visible", { mode: "boolean" }).notNull().default(false), createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
export const files = sqliteTable("files", {
  id: integer("id").primaryKey({ autoIncrement: true }), objectKey: text("object_key").notNull().unique(), originalName: text("original_name").notNull(), contentType: text("content_type"), size: integer("size"), entityType: text("entity_type").notNull(), entityId: integer("entity_id").notNull(), createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const admins = sqliteTable("admins", {
  email: text("email").primaryKey(),
  name: text("name"),
  role: text("role"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  createdBy: text("created_by"),
});

// The operational V1 screens keep their existing record shapes while D1 owns the
// shared, cross-device source of truth. Individual workflow tables can be
// normalised further without breaking the current console during that migration.
export const appState = sqliteTable("app_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const supportRequests = sqliteTable("support_requests", {
  id: text("id").primaryKey(),
  issueType: text("issue_type").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  details: text("details").notNull(),
  businessContext: text("business_context"),
  selectedService: text("selected_service"),
  selectedItem: text("selected_item"),
  status: text("status").notNull().default("New"),
  createdAt: text("created_at").notNull(),
  lastAction: text("last_action"),
});
