import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type RuntimeEnvironment = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  SUPPORT_NOTIFICATION_WEBHOOK_URL?: string;
};

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}

export function getRuntimeEnvironment() {
  return env as RuntimeEnvironment;
}

export function getBucket() {
  const bucket = getRuntimeEnvironment().BUCKET;
  if (!bucket) {
    throw new Error("Cloudflare R2 binding `BUCKET` is unavailable.");
  }
  return bucket;
}
