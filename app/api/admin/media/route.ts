import { getBucket, getDb } from "../../../../db";
import { appState, supportRequests } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { isAdminRequest } from "../../../admin/admin-server";

export const dynamic = "force-dynamic";
const allowedTypes = new Set(["image/webp", "image/jpeg", "image/png"]);
const allowedMediaPrefixes = ["equipment/", "favicon/", "hero/", "logo/", "portfolio/"] as const;

// server-side admin check uses centralized helper `isAdminRequest`

function extensionFor(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  return "webp";
}

function isAllowedMediaKey(key: string) {
  return allowedMediaPrefixes.some((prefix) => key.startsWith(prefix) && key.length > prefix.length) && !key.includes("..") && !key.includes("\\");
}

function folderFromKey(key: string) {
  return allowedMediaPrefixes.find((prefix) => key.startsWith(prefix))?.slice(0, -1) ?? "media";
}

function slugifyName(value: string, fallback: string) {
  const slug = value
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    .replace(/-+$/g, "");

  return slug || fallback;
}

function displayNameFromKey(key: string) {
  const fileName = key.split("/").pop() ?? key;
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/-[a-f0-9]{8}$/i, "")
    .replace(/-/g, " ");
}

function collectMediaKeysFromText(value: string, keys: Set<string>) {
  const pattern = /\/api\/media\/([^"'\s)<>]+)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value))) {
    try {
      const key = decodeURIComponent(match[1].split(/[?#]/)[0]);
      if (isAllowedMediaKey(key)) keys.add(key);
    } catch {
      // Ignore malformed legacy URLs while continuing to protect valid media.
    }
  }
}

async function getUsedMediaKeys() {
  const keys = new Set<string>();
  const db = getDb();
  const stateRows = await db.select().from(appState);

  for (const row of stateRows) collectMediaKeysFromText(row.value, keys);

  const requestRows = await db.select().from(supportRequests);
  for (const row of requestRows) {
    const fields = [
      row.issueType,
      row.name,
      row.email,
      row.phone,
      row.details,
      row.businessContext,
      row.selectedService,
      row.selectedItem,
      row.status,
      row.createdAt,
      row.lastAction,
    ];
    for (const field of fields) {
      if (field) collectMediaKeysFromText(field, keys);
    }
  }

  return keys;
}

async function listUploadedMedia() {
  const objects: R2Object[] = [];

  for (const prefix of allowedMediaPrefixes) {
    let cursor: string | undefined;
    do {
      const page = await getBucket().list({ prefix, cursor });
      objects.push(...page.objects);
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
  }

  return objects;
}

export async function GET() {
  if (!await isAdminRequest()) return Response.json({ error: "Unauthorised" }, { status: 401 });

  let usedKeys = new Set<string>();
  let usageKnown = true;

  try {
    usedKeys = await getUsedMediaKeys();
  } catch {
    usageKnown = false;
  }

  try {
    const objects = await listUploadedMedia();
    const items = objects
      .filter((object) => isAllowedMediaKey(object.key))
      .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime())
      .map((object) => {
        const used = usedKeys.has(object.key);
        return {
          key: object.key,
          url: `/api/media/${object.key}`,
          name: displayNameFromKey(object.key),
          folder: folderFromKey(object.key),
          size: object.size,
          uploadedAt: object.uploaded.toISOString(),
          used,
          usageStatus: usageKnown ? used ? "used" : "unused" : "unknown",
          canDelete: usageKnown && !used,
        };
      });

    return Response.json({ items, usageKnown });
  } catch {
    return Response.json({ error: "Image library is unavailable. Check the R2 binding and try again." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!await isAdminRequest()) return Response.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") return Response.json({ error: "Choose an image to upload." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return Response.json({ error: "Upload a WebP, JPEG, or PNG image." }, { status: 400 });
    if (file.size > 4 * 1024 * 1024) return Response.json({ error: "Keep the uploaded image below 4 MB." }, { status: 413 });

    const requestedFolder = formData.get("folder");
    const folder = requestedFolder === "favicon" || requestedFolder === "hero" || requestedFolder === "logo" || requestedFolder === "portfolio" ? requestedFolder : "equipment";
    const requestedName = formData.get("name");
    const imageName = slugifyName(typeof requestedName === "string" ? requestedName : file.name, `${folder}-image`);
    const key = `${folder}/${imageName}-${crypto.randomUUID().slice(0, 8)}.${extensionFor(file.type)}`;
    await getBucket().put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    return Response.json({ key, name: imageName, url: `/api/media/${key}` }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/payload too large/i.test(message)) {
      return Response.json({ error: "That image is too large to upload. Try a smaller or cropped image." }, { status: 413 });
    }
    return Response.json({ error: "Image upload is unavailable. Check the R2 binding and try again." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdminRequest()) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!isAllowedMediaKey(key)) {
    return Response.json({ error: "Invalid image key." }, { status: 400 });
  }

  try {
    const usedKeys = await getUsedMediaKeys();
    if (usedKeys.has(key)) {
      return Response.json({ error: "This image is still used by the website or an admin record. Remove it there first, then try again." }, { status: 409 });
    }

    await getBucket().delete(key);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Image removal is unavailable because usage could not be checked." }, { status: 503 });
  }
}
