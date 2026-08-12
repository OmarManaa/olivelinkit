import { redirect } from "next/navigation";
import { getChatGPTUser } from "../chatgpt-auth";

export const ADMIN_EMAIL = "omar.manaa@gmail.com";

export async function requireAdmin() {
  let user = null;
  try {
    user = await getChatGPTUser();
  } catch (err) {
    // If header parsing or environment throws, treat as unauthorised rather than letting the worker crash.
    // Logging is not available here; redirect to the not-authorized page instead.
    redirect("/not-authorized");
  }

  if (user?.email.toLowerCase() === ADMIN_EMAIL) return user;

  // Local UI testing only. Production builds never receive this shortcut.
  if (process.env.NODE_ENV === "development" && !user) {
    return { email: ADMIN_EMAIL, displayName: "Omar Manaa (local)", fullName: "Omar Manaa" };
  }

  if (!user) redirect("/not-authorized");
  redirect("/not-authorized");
}
