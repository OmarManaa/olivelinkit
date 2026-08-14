import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { appState } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { isPersistedStateKey } from "../../persisted-state";
import { isAdminRequest } from "../../admin/admin-server";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "omar.manaa@gmail.com";

function allowedRequestOrigin(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (!origin) return null;
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return origin;
  } catch {
    return null;
  }
}

function withCors(request: Request, response: Response) {
  const origin = allowedRequestOrigin(request);
  if (!origin) return response;

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "content-type");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function OPTIONS(request: Request) {
  return withCors(request, new Response(null, { status: 204 }));
}

function parseValue(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function messageFor(error: unknown) {
  const message = error instanceof Error ? error.message : "The database is unavailable.";
  return message.includes("no such table")
    ? "The D1 migration has not been applied yet."
    : "The database is unavailable. Please try again.";
}

export async function GET(request: Request) {
  if (!await isAdminRequest()) return withCors(request, new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: { "content-type": "application/json" } }));

  try {
    const rows = await getDb().select().from(appState);
    const records = Object.fromEntries(rows.map((row) => [row.key, parseValue(row.value)]));
    return withCors(request, new Response(JSON.stringify({ records }), { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } }));
  } catch (error) {
    return withCors(request, new Response(JSON.stringify({ error: messageFor(error) }), { status: 503, headers: { "content-type": "application/json" } }));
  }
}

export async function PUT(request: Request) {
  if (!await isAdminRequest()) return withCors(request, new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: { "content-type": "application/json" } }));

  try {
    const payload = await request.json() as { key?: string; value?: unknown | null };
    if (!payload.key || !isPersistedStateKey(payload.key) || !("value" in payload)) {
      return withCors(request, new Response(JSON.stringify({ error: "Invalid state update." }), { status: 400, headers: { "content-type": "application/json" } }));
    }

    const db = getDb();
    if (payload.value === null) {
      await db.delete(appState).where(eq(appState.key, payload.key));
    } else {
      const value = JSON.stringify(payload.value);
      if (value.length > 900_000) return withCors(request, new Response(JSON.stringify({ error: "This saved record is too large. Upload images to R2 instead of storing them in browser data." }), { status: 413, headers: { "content-type": "application/json" } }));
      await db.insert(appState).values({ key: payload.key, value, updatedAt: new Date() }).onConflictDoUpdate({
        target: appState.key,
        set: { value, updatedAt: new Date() },
      });
    }

    return withCors(request, new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } }));
  } catch (error) {
    return withCors(request, new Response(JSON.stringify({ error: messageFor(error) }), { status: 503, headers: { "content-type": "application/json" } }));
  }
}
