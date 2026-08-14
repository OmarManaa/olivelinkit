import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "../../db";
import { appState } from "../../db/schema";
import { getChatGPTUser } from "../chatgpt-auth";
import { isCloudflareAdminRequest } from "./admin-server";

export const ADMIN_EMAIL = "omar.manaa@gmail.com";
export const ADMIN_SESSION_COOKIE = "olive_admin_session";
export const ADMIN_CONFIG_KEY = "admin_login";
export const ADMIN_USERNAME = (process.env.ADMIN_USERNAME ?? "omarmanaa").trim();
export const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD ?? "OliveLinkIT2026!").trim();

function decodeAdminSession(value: string | undefined): { username: string; issuedAt: number } | null {
  if (!value) return null;

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as { username?: string; issuedAt?: number };
    if (!parsed.username || typeof parsed.issuedAt !== "number") return null;
    return { username: parsed.username, issuedAt: parsed.issuedAt };
  } catch {
    return null;
  }
}

export async function getStoredAdminCredentials(): Promise<{ username: string; password: string } | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(appState).where(eq(appState.key, ADMIN_CONFIG_KEY));
    const value = rows[0]?.value;
    if (!value) return null;

    const parsed = JSON.parse(value) as { username?: string; password?: string };
    if (typeof parsed.username !== "string" || typeof parsed.password !== "string") return null;

    const username = parsed.username.trim();
    const password = parsed.password.trim();
    if (!username || !password) return null;

    return { username, password };
  } catch {
    return null;
  }
}

export async function setStoredAdminCredentials(username: string, password: string) {
  const db = getDb();
  const nextUsername = username.trim();
  const nextPassword = password.trim();

  const payload = JSON.stringify({ username: nextUsername, password: nextPassword, updatedAt: Date.now() });
  const rows = await db.select().from(appState).where(eq(appState.key, ADMIN_CONFIG_KEY));

  if (rows.length > 0) {
    await db.update(appState).set({ value: payload, updatedAt: new Date() }).where(eq(appState.key, ADMIN_CONFIG_KEY));
    return;
  }

  await db.insert(appState).values({ key: ADMIN_CONFIG_KEY, value: payload, updatedAt: new Date() });
}

export async function getActiveAdminCredentials() {
  const stored = await getStoredAdminCredentials();
  if (stored) return stored;
  return { username: ADMIN_USERNAME, password: ADMIN_PASSWORD };
}

export async function authenticateAdminCredentials(username: string, password: string) {
  const candidateUser = (username ?? "").trim();
  const candidatePassword = (password ?? "").trim();
  const active = await getActiveAdminCredentials();

  return (
    candidateUser.toLowerCase() === active.username.toLowerCase() &&
    candidatePassword === active.password
  );
}

export async function setAdminSession(username: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, Buffer.from(JSON.stringify({ username, issuedAt: Date.now() })).toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function hasValidAdminSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = decodeAdminSession(sessionValue);
  if (!session) return false;

  const active = await getActiveAdminCredentials();
  return session.username.toLowerCase() === active.username.toLowerCase();
}

export async function isAdminRequest() {
  let user = null;

  try {
    user = await getChatGPTUser();
  } catch {
    user = null;
  }

  if (user?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;
  if (await isCloudflareAdminRequest()) return true;
  return hasValidAdminSession();
}

export async function requireAdmin() {
  let user = null;

  try {
    user = await getChatGPTUser();
  } catch {
    user = null;
  }

  const cloudflareAllowed = user ? await isCloudflareAdminRequest() : false;
  if (cloudflareAllowed) return user;

  if (user && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return user;

  if (await hasValidAdminSession()) {
    return {
      email: ADMIN_EMAIL,
      displayName: "Administrator",
      fullName: "Administrator",
    };
  }

  redirect("/admin/login");
}
