import { NextResponse } from "next/server";
import { authenticateAdminCredentials, getActiveAdminCredentials, setAdminSession, setStoredAdminCredentials } from "../../../admin/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as {
      currentUsername?: string;
      currentPassword?: string;
      newUsername?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const currentUsername = (payload.currentUsername ?? "").trim();
    const currentPassword = (payload.currentPassword ?? "").trim();
    const newUsername = (payload.newUsername ?? "").trim();
    const newPassword = (payload.newPassword ?? "").trim();
    const confirmPassword = (payload.confirmPassword ?? "").trim();

    if (!currentUsername || !currentPassword || !newUsername || !newPassword || !confirmPassword) {
      return NextResponse.json({ ok: false, error: "All fields are required." }, { status: 400 });
    }

    const active = await getActiveAdminCredentials();
    const validCurrent = currentUsername.toLowerCase() === active.username.toLowerCase() && currentPassword === active.password;
    if (!validCurrent) {
      return NextResponse.json({ ok: false, error: "The current username or password is incorrect." }, { status: 401 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ ok: false, error: "New password must be at least 8 characters long." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ ok: false, error: "The new password and confirmation do not match." }, { status: 400 });
    }

    await setStoredAdminCredentials(newUsername, newPassword);
    await setAdminSession(newUsername);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to update the admin credentials." }, { status: 500 });
  }
}
