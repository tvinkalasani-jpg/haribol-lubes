import { NextResponse } from "next/server";
import { getPayload } from "payload";

import config from "@payload-config";
import { cmsEnvironment } from "@/cms/environment";
import { readPrivateDocument } from "@/lib/storage/private-documents";

type RouteContext = { params: Promise<{ slug: string }> };
type Relation = number | string | { id?: number | string } | null | undefined;

function relationId(value: Relation): number | string | undefined {
  if (typeof value === "number" || typeof value === "string") return value;
  return value?.id;
}

export async function GET(request: Request, { params }: RouteContext) {
  if (!cmsEnvironment.configured) return new NextResponse("Not found", { status: 404 });
  const { slug } = await params;
  const payload = await getPayload({ config });
  const result = await payload.find({ collection: "resources", where: { slug: { equals: slug } }, depth: 0, limit: 1, overrideAccess: false });
  const resource = result.docs[0];
  if (!resource) return new NextResponse("Not found", { status: 404 });

  const mediaId = relationId(resource.file as Relation);
  const technicalDocumentId = relationId(resource.technicalDocument as Relation);
  if (technicalDocumentId) {
    const document = await payload.findByID({ collection: "technical-documents", id: technicalDocumentId, depth: 0, overrideAccess: true });
    if (document.publicationStatus !== "published" || document.verificationStatus !== "verified") {
      return new NextResponse("Not found", { status: 404 });
    }
    const privateDocumentId = relationId(document.file as Relation);
    if (!privateDocumentId) return new NextResponse("Not found", { status: 404 });
    const privateDocument = await payload.findByID({ collection: "private-documents", id: privateDocumentId, depth: 0, overrideAccess: true });
    if (privateDocument.verificationStatus !== "verified" || typeof privateDocument.filename !== "string") {
      return new NextResponse("Not found", { status: 404 });
    }
    const file = await readPrivateDocument(privateDocument.filename, privateDocument.prefix).catch(() => undefined);
    if (!file) return new NextResponse("Not found", { status: 404 });
    const filename = privateDocument.filename.replace(/[^a-zA-Z0-9._ -]/g, "_");
    return new NextResponse(new Uint8Array(file.body).buffer, {
      headers: {
        "Content-Type": privateDocument.mimeType || file.contentType || "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  if (!mediaId) return new NextResponse("Not found", { status: 404 });

  const media = await payload.findByID({ collection: "media", id: mediaId, depth: 0, overrideAccess: true });
  if (media.verificationStatus !== "verified" || typeof media.url !== "string") {
    return new NextResponse("Not found", { status: 404 });
  }
  const target = new URL(media.url, request.url);
  if (target.origin !== new URL(request.url).origin) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(target, 307);
}
