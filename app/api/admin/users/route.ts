import { getDb } from "../../../../db";
import { admins } from "../../../../db/schema";
import { isAdminRequest } from "../../../admin/admin-server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await isAdminRequest()) return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: { "content-type": "application/json" } });
  try {
    const db = getDb();
    const rows = await db.select().from(admins);
    return new Response(JSON.stringify({ items: rows }), { status: 200, headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Admin list unavailable" }), { status: 503, headers: { "content-type": "application/json" } });
  }
}

export async function POST(request: Request) {
  if (!await isAdminRequest()) return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: { "content-type": "application/json" } });
  try {
    const payload = await request.json() as { email: string; name?: string; role?: string; createdBy?: string };
    if (!payload?.email) return new Response(JSON.stringify({ error: "Missing email" }), { status: 400, headers: { "content-type": "application/json" } });
    const db = getDb();
    const now = new Date();
    await db.insert(admins).values({ email: payload.email.toLowerCase(), name: payload.name ?? null, role: payload.role ?? null, active: 1, createdAt: now, createdBy: payload.createdBy ?? null });
    return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { "content-type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Could not create admin" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}

export async function PUT(request: Request) {
  if (!await isAdminRequest()) return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: { "content-type": "application/json" } });
  try {
    const payload = await request.json() as { email: string; name?: string; role?: string; active?: boolean };
    if (!payload?.email) return new Response(JSON.stringify({ error: "Missing email" }), { status: 400, headers: { "content-type": "application/json" } });
    const db = getDb();
    await db.update(admins).set({ name: payload.name ?? null, role: payload.role ?? null, active: payload.active ? 1 : 0 }).where({ email: payload.email.toLowerCase() } as any);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Could not update admin" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdminRequest()) return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: { "content-type": "application/json" } });
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    if (!email) return new Response(JSON.stringify({ error: "Missing email" }), { status: 400, headers: { "content-type": "application/json" } });
    const db = getDb();
    await db.delete(admins).where({ email: email.toLowerCase() } as any);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Could not delete admin" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
