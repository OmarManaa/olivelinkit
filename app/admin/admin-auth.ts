import { redirect } from "next/navigation";
import { getChatGPTUser } from "../chatgpt-auth";
import { isAdminRequest } from "./admin-server";

export const ADMIN_EMAIL = "omar.manaa@gmail.com";

export async function requireAdmin() {
  let user = null;
  try {
    user = await getChatGPTUser();
  } catch (err) {
    // If header parsing or environment throws, treat as unauthorised rather than letting the worker crash.
    redirect("/not-authorized");
  }

  const allowed = await isAdminRequest();
  if (!allowed) redirect("/not-authorized");

  if (user) return user;

  if (process.env.NODE_ENV === "development") {
    return { email: ADMIN_EMAIL, displayName: "Omar Manaa (local)", fullName: "Omar Manaa" };
  }

  redirect("/not-authorized");
}
