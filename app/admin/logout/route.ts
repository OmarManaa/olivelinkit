import { NextResponse } from "next/server";
import { clearAdminSession } from "../admin-auth";

export async function GET() {
  await clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL ?? "https://olivelinkit.au"));
}
