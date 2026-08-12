import { getDb } from "../../db";
import { admins } from "../../db/schema";
import { getChatGPTUser } from "../chatgpt-auth";

export async function isAdminRequest(): Promise<boolean> {
  try {
    const user = await getChatGPTUser();
    if (!user?.email) return false;
    const db = getDb();
    const rows = await db.select().from(admins).where({ email: user.email.toLowerCase() as any });
    if (rows.length > 0) return Boolean(rows[0].active);
    // fallback: allow a single env-configured admin in development
    if (process.env.NODE_ENV === "development" && user.email.toLowerCase() === (process.env.ADMIN_EMAIL ?? "").toLowerCase()) return true;
    return false;
  } catch {
    return false;
  }
}
