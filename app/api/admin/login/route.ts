import { NextResponse } from "next/server";
import { authenticateAdminCredentials, setAdminSession } from "../../../admin/admin-auth";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { username?: string; password?: string };
    const username = (payload.username ?? "").trim();
    const password = (payload.password ?? "").trim();

    const ok = await authenticateAdminCredentials(username, password);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Incorrect username or password." }, { status: 401 });
    }

    await setAdminSession(username);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to sign in." }, { status: 500 });
  }
}
