import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

import config from "@payload-config";
import { cmsEnvironment } from "@/cms/environment";

type RouteContext = { params: Promise<{ slug: string }> };
type Relation = number | string | { id?: number | string } | null | undefined;

function relationId(value: Relation): number | string | undefined {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id;
}

export async function GET(_request: Request, { params }: RouteContext) {
  if (!cmsEnvironment.configured) return new NextResponse("Not found", { status: 404 });
  const { slug } = await params;
  const payload = await getPayload({ config });
  const result = await payload.find({ collection: "resources", where: { slug: { equals: slug } }, depth: 0, limit: 1, overrideAccess: false });
  const resource = result.docs[0];
  if (!resource) return new NextResponse("Not found", { status: 404 });

  let mediaId = relationId(resource.file as Relation);
  const technicalDocumentId = relationId(resource.technicalDocument as Relation);
  if (technicalDocumentId) {
    const document = await payload.findByID({ collection: "technical-documents", id: technicalDocumentId, depth: 0, overrideAccess: true });
    if (document.publicationStatus !== "published" || document.verificationStatus !== "verified") {
      return new NextResponse("Not found", { status: 404 });
    }
    mediaId = relationId(document.file as Relation);
  }
  if (!mediaId) return new NextResponse("Not found", { status: 404 });

  const media = await payload.findByID({ collection: "media", id: mediaId, depth: 0, overrideAccess: true });
  if (media.verificationStatus !== "verified" || typeof media.filename !== "string") {
    return new NextResponse("Not found", { status: 404 });
  }
  const filename = path.basename(media.filename);
  const buffer = await readFile(path.join(process.cwd(), "media", filename)).catch(() => undefined);
  if (!buffer) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": media.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename.replaceAll('"', "")}"`,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
