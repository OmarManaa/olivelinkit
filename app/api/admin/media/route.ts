import { getBucket } from "../../../../db";
import { getChatGPTUser } from "../../../chatgpt-auth";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "omar.manaa@gmail.com";
const allowedTypes = new Set(["image/webp", "image/jpeg", "image/png"]);

async function isAdminRequest() {
  const user = await getChatGPTUser();
  return user?.email.toLowerCase() === ADMIN_EMAIL || (process.env.NODE_ENV === "development" && !user);
}

function extensionFor(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  return "webp";
}

export async function POST(request: Request) {
  if (!await isAdminRequest()) return Response.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") return Response.json({ error: "Choose an image to upload." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return Response.json({ error: "Upload a WebP, JPEG, or PNG image." }, { status: 400 });
    if (file.size > 4 * 1024 * 1024) return Response.json({ error: "Keep the uploaded image below 4 MB." }, { status: 413 });

    const folder = formData.get("folder") === "hero" ? "hero" : "equipment";
    const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extensionFor(file.type)}`;
    await getBucket().put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    return Response.json({ key, url: `/api/media/${key}` }, { status: 201 });
  } catch {
    return Response.json({ error: "Image upload is unavailable. Check the R2 binding and try again." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdminRequest()) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const key = new URL(request.url).searchParams.get("key") ?? "";
  if ((!key.startsWith("equipment/") && !key.startsWith("hero/")) || key.includes("..")) {
    return Response.json({ error: "Invalid image key." }, { status: 400 });
  }

  try {
    await getBucket().delete(key);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Image removal is unavailable." }, { status: 503 });
  }
}
