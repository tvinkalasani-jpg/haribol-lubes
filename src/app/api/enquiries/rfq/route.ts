import { createHash } from "node:crypto";

import { products } from "@/data/catalogue/products";
import { catalogueCategories } from "@/data/catalogue/categories";
import { industries } from "@/data/industries";
import { createEnquiryNotifier } from "@/features/enquiries/notifier";
import { InMemoryRfqRateLimiter } from "@/features/enquiries/rate-limit";
import { createEnquiryRepository } from "@/features/enquiries/repository-factory";
import { RfqService } from "@/features/enquiries/rfq-service";
import { validateJsonMutationRequest } from "@/lib/security/request";
import { rfqLimits } from "@/lib/validation/rfq";

export const runtime = "nodejs";

const limiter = new InMemoryRfqRateLimiter();
const categoryIds = catalogueCategories.filter((category) => !category.parentCategoryId && category.id !== "specialty-fluids").map((category) => category.id);
const validationContext = { products: products.map(({ id, slug }) => ({ id, slug })), categoryIds, industrySlugs: industries.map(({ slug }) => slug) };

function fingerprint(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const agent = request.headers.get("user-agent") || "unknown";
  return createHash("sha256").update(`${forwarded}|${agent}`).digest("hex").slice(0, 24);
}

export async function POST(request: Request): Promise<Response> {
  const securityFailure = validateJsonMutationRequest(request);
  if (securityFailure) {
    return Response.json(securityFailure, {
      status: securityFailure.status,
      headers: { "Cache-Control": "no-store" },
    });
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > rfqLimits.payloadBytes) return Response.json({ type: "validation_error", message: "The quotation request is too large.", errors: { message: "Reduce the message length and try again." } }, { status: 413, headers: { "Cache-Control": "no-store" } });
  let raw: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > rfqLimits.payloadBytes) throw new RangeError();
    raw = JSON.parse(text);
  } catch (error) {
    const status = error instanceof RangeError ? 413 : 400;
    return Response.json({ type: "validation_error", message: "The quotation request could not be read.", errors: {} }, { status, headers: { "Cache-Control": "no-store" } });
  }
  let service: RfqService;
  try { service = new RfqService(createEnquiryRepository(), createEnquiryNotifier(), limiter); }
  catch { return Response.json({ type: "storage_error", message: "Quotation persistence is not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
  const result = await service.submit({ raw, context: validationContext, requestFingerprint: fingerprint(request) });
  const status = result.type === "success" ? 200 : result.type === "validation_error" ? 400 : result.type === "rate_limited" ? 429 : 500;
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (result.type === "rate_limited") headers["Retry-After"] = String(result.retryAfterSeconds);
  return Response.json(result, { status, headers });
}
