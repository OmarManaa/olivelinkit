import { getDb } from "../../../../db";
import { files } from "../../../../db/schema";
import { isAdminRequest } from "../../../admin/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await isAdminRequest()) return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: { "content-type": "application/json" } });

  try {
    const db = getDb();
    const rows = await db.select().from(files);
    return new Response(JSON.stringify({ items: rows }), { status: 200, headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "File metadata is unavailable." }), { status: 503, headers: { "content-type": "application/json" } });
  }
}
