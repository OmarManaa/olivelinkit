import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { appState } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { isPersistedStateKey } from "../../persisted-state";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "omar.manaa@gmail.com";

async function isAdminRequest() {
  const user = await getChatGPTUser();
  return user?.email.toLowerCase() === ADMIN_EMAIL || (process.env.NODE_ENV === "development" && !user);
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

export async function GET() {
  if (!await isAdminRequest()) return Response.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const rows = await getDb().select().from(appState);
    const records = Object.fromEntries(rows.map((row) => [row.key, parseValue(row.value)]));
    return Response.json({ records }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: messageFor(error) }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  if (!await isAdminRequest()) return Response.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const payload = await request.json() as { key?: string; value?: unknown | null };
    if (!payload.key || !isPersistedStateKey(payload.key) || !("value" in payload)) {
      return Response.json({ error: "Invalid state update." }, { status: 400 });
    }

    const db = getDb();
    if (payload.value === null) {
      await db.delete(appState).where(eq(appState.key, payload.key));
    } else {
      const value = JSON.stringify(payload.value);
      if (value.length > 900_000) return Response.json({ error: "This saved record is too large. Upload images to R2 instead of storing them in browser data." }, { status: 413 });
      await db.insert(appState).values({ key: payload.key, value, updatedAt: new Date() }).onConflictDoUpdate({
        target: appState.key,
        set: { value, updatedAt: new Date() },
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: messageFor(error) }, { status: 503 });
  }
}
