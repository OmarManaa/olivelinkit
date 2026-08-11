import { desc, eq } from "drizzle-orm";
import { getDb, getRuntimeEnvironment } from "../../../db";
import { supportRequests } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import type { SupportRequest } from "../../support-requests-store";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "omar.manaa@gmail.com";
const allowedStatuses = ["New", "Replied", "Follow-up", "Converted", "Closed"] as const;

function trimmed(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function parseSelectedItem(value: string | null) {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as SupportRequest["selectedItem"];
  } catch {
    return undefined;
  }
}

function toRequest(row: typeof supportRequests.$inferSelect): SupportRequest {
  return {
    id: row.id,
    issueType: row.issueType,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    details: row.details,
    businessContext: row.businessContext ?? undefined,
    selectedService: row.selectedService ?? undefined,
    selectedItem: parseSelectedItem(row.selectedItem),
    status: row.status as SupportRequest["status"],
    createdAt: row.createdAt,
    lastAction: row.lastAction ?? undefined,
  };
}

function cleanStatus(value: unknown): SupportRequest["status"] {
  return allowedStatuses.includes(value as (typeof allowedStatuses)[number]) ? value as SupportRequest["status"] : "New";
}

function cleanBackupRequest(value: unknown): SupportRequest | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<SupportRequest>;
  const id = trimmed(item.id, 80);
  const name = trimmed(item.name, 120);
  const details = trimmed(item.details, 4_000);
  if (!id || !name || !details) return null;
  return {
    id,
    issueType: trimmed(item.issueType, 100) || "Computer repair",
    name,
    email: trimmed(item.email, 160) || undefined,
    phone: trimmed(item.phone, 60) || undefined,
    details,
    businessContext: trimmed(item.businessContext, 500) || undefined,
    selectedService: trimmed(item.selectedService, 180) || undefined,
    selectedItem: item.selectedItem,
    status: cleanStatus(item.status),
    createdAt: trimmed(item.createdAt, 80) || new Date().toISOString(),
    lastAction: trimmed(item.lastAction, 80) || undefined,
  };
}

function dbValues(record: SupportRequest): typeof supportRequests.$inferInsert {
  return {
    id: record.id,
    issueType: record.issueType,
    name: record.name,
    email: record.email,
    phone: record.phone,
    details: record.details,
    businessContext: record.businessContext,
    selectedService: record.selectedService,
    selectedItem: record.selectedItem ? JSON.stringify(record.selectedItem) : null,
    status: record.status,
    createdAt: record.createdAt,
    lastAction: record.lastAction,
  };
}

async function isAdminRequest() {
  const user = await getChatGPTUser();
  return user?.email.toLowerCase() === ADMIN_EMAIL || (process.env.NODE_ENV === "development" && !user);
}

function messageFor(error: unknown) {
  const message = error instanceof Error ? error.message : "The request could not be saved.";
  return message.includes("no such table")
    ? "The request service is not ready yet. Please use email or WhatsApp, or try again shortly."
    : "The request could not be saved. Please try again or use email or WhatsApp.";
}

async function notifyAdmin(request: SupportRequest) {
  const url = getRuntimeEnvironment().SUPPORT_NOTIFICATION_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "support_request.created", request }),
    });
  } catch {
    // A saved enquiry remains visible in the admin inbox even when a notification provider is unavailable.
  }
}

export async function GET() {
  if (!await isAdminRequest()) return Response.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const rows = await getDb().select().from(supportRequests).orderBy(desc(supportRequests.createdAt));
    return Response.json({ requests: rows.map(toRequest) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: messageFor(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Partial<SupportRequest> & { company?: string };
    if (trimmed(payload.company, 120)) return Response.json({ ok: true }, { status: 202 });

    const name = trimmed(payload.name, 120);
    const email = trimmed(payload.email, 160);
    const phone = trimmed(payload.phone, 60);
    const details = trimmed(payload.details, 4_000);
    const issueType = trimmed(payload.issueType, 100) || "Computer repair";
    if (!name || (!email && !phone)) {
      return Response.json({ error: "Please provide your name and at least one contact method." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const record: SupportRequest = {
      id: `REQ-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`,
      issueType,
      name,
      email: email || undefined,
      phone: phone || undefined,
      details: details || "No details provided yet.",
      businessContext: trimmed(payload.businessContext, 500) || undefined,
      selectedService: trimmed(payload.selectedService, 180) || undefined,
      selectedItem: payload.selectedItem,
      status: "New",
      createdAt: now,
    };

    await getDb().insert(supportRequests).values(dbValues(record));
    await notifyAdmin(record);

    return Response.json({ request: record }, { status: 201 });
  } catch (error) {
    return Response.json({ error: messageFor(error) }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  if (!await isAdminRequest()) return Response.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const payload = await request.json() as { requests?: unknown[] };
    if (!Array.isArray(payload.requests)) return Response.json({ error: "Choose a valid support request backup." }, { status: 400 });
    if (payload.requests.length > 1_000) return Response.json({ error: "Restore 1000 support requests or fewer at a time." }, { status: 413 });

    const records = payload.requests.map(cleanBackupRequest).filter((item): item is SupportRequest => Boolean(item));
    if (records.length !== payload.requests.length) return Response.json({ error: "One or more support requests in the backup are invalid." }, { status: 400 });

    const db = getDb();
    for (const record of records) {
      await db.insert(supportRequests).values(dbValues(record)).onConflictDoUpdate({
        target: supportRequests.id,
        set: dbValues(record),
      });
    }

    const rows = await db.select().from(supportRequests).orderBy(desc(supportRequests.createdAt));
    return Response.json({ ok: true, requests: rows.map(toRequest) });
  } catch (error) {
    return Response.json({ error: messageFor(error) }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!await isAdminRequest()) return Response.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const payload = await request.json() as { id?: string; status?: string };
    if (!payload.id || !payload.status || !allowedStatuses.includes(payload.status as (typeof allowedStatuses)[number])) {
      return Response.json({ error: "Invalid support request update." }, { status: 400 });
    }
    const lastAction = new Date().toISOString();
    const db = getDb();
    await db.update(supportRequests).set({ status: payload.status, lastAction }).where(eq(supportRequests.id, payload.id));
    const row = await db.select().from(supportRequests).where(eq(supportRequests.id, payload.id)).get();
    if (!row) return Response.json({ error: "Support request not found." }, { status: 404 });
    return Response.json({ request: toRequest(row) });
  } catch (error) {
    return Response.json({ error: messageFor(error) }, { status: 503 });
  }
}
