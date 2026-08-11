import { getBucket } from "../../../../db";

export const dynamic = "force-dynamic";

type MediaRouteContext = { params: Promise<{ key: string[] }> };

export async function GET(_request: Request, { params }: MediaRouteContext) {
  const { key: parts } = await params;
  const key = parts.join("/");
  if ((!key.startsWith("equipment/") && !key.startsWith("favicon/") && !key.startsWith("hero/") && !key.startsWith("logo/")) || key.includes("..")) return new Response("Not found", { status: 404 });

  try {
    const object = await getBucket().get(key);
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, {
      headers: {
        "content-type": object.httpMetadata?.contentType || "application/octet-stream",
        "cache-control": object.httpMetadata?.cacheControl || "public, max-age=86400",
        etag: object.httpEtag,
      },
    });
  } catch {
    return new Response("Image service unavailable", { status: 503 });
  }
}
