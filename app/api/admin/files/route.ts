import { getDb } from "../../../../db";
import { files } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "omar.manaa@gmail.com";

async function isAdminRequest() {
  const user = await getChatGPTUser();
  return user?.email.toLowerCase() === ADMIN_EMAIL || (process.env.NODE_ENV === "development" && !user);
}

export async function GET() {
  if (!await isAdminRequest()) return new Response(JSON.stringify({ error: "Unauthorised" }), { status: 401, headers: { "content-type": "application/json" } });

  try {
    const db = getDb();
    const rows = await db.select().from(files);
    return new Response(JSON.stringify({ items: rows }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "File metadata is unavailable." }), { status: 503, headers: { "content-type": "application/json" } });
  }
}
