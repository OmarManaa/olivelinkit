import { getPublishedSiteData } from "../../site-data-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getPublishedSiteData();
  return Response.json(data, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
