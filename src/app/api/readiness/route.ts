import { timingSafeEqual } from "node:crypto";

import config from "@payload-config";
import { getPayload } from "payload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const token = process.env.READINESS_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token.length < 32 || !supplied) return false;
  const expectedBuffer = Buffer.from(token);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function GET(request: Request): Promise<Response> {
  if (!authorized(request)) return Response.json({ status: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  try {
    const payload = await getPayload({ config });
    await payload.count({ collection: "users", overrideAccess: true });
    return Response.json({ status: "ready", checks: { database: "ok" } }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "unavailable", checks: { database: "failed" } }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
