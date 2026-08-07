import { redirect } from "next/navigation";
import { getChatGPTUser } from "../chatgpt-auth";

export const ADMIN_EMAIL = "omar.manaa@gmail.com";

export async function requireAdmin() {
  const user = await getChatGPTUser();
  if (user?.email.toLowerCase() === ADMIN_EMAIL) return user;

  // Local UI testing only. Production builds never receive this shortcut.
  if (process.env.NODE_ENV === "development" && !user) {
    return { email: ADMIN_EMAIL, displayName: "Omar Manaa (local)", fullName: "Omar Manaa" };
  }

  if (!user) redirect(`/signin-with-chatgpt?return_to=${encodeURIComponent("/admin")}`);
  redirect("/not-authorized");
}
