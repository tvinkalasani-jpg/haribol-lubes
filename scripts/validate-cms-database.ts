import { getPayload } from "payload";

import config from "@payload-config";
import { assertCmsEnvironment } from "@/cms/environment";
import { catalogueCategories } from "@/data/catalogue/categories";
import { products } from "@/data/catalogue/products";
import { industries } from "@/data/industries";
import type { EnquiryNotifier } from "@/features/enquiries/notifier";
import { PayloadEnquiryRepository } from "@/features/enquiries/payload-repository";
import type { RfqRateLimiter } from "@/features/enquiries/rate-limit";
import { RfqService } from "@/features/enquiries/rfq-service";
import { PayloadCatalogueRepository } from "@/features/catalogue/payload-catalogue-repository";
import { StaticCatalogueRepository } from "@/features/catalogue/static-catalogue-repository";

function check(label: string, condition: boolean): void {
  if (!condition) throw new Error(`FAIL ${label}`);
  console.info(`PASS ${label}`);
}

assertCmsEnvironment();
const payload = await getPayload({ config });
const collections = ["brands", "product-categories", "products", "product-variants", "applications", "specifications", "markets", "product-offers", "orders", "payment-transactions"] as const;
const counts = Object.fromEntries(await Promise.all(collections.map(async (collection) => [collection, (await payload.count({ collection, overrideAccess: true })).totalDocs])));
check("seeded brand count", counts.brands === 1);
check("seeded product count", counts.products === 10);
check("seeded variant count", counts["product-variants"] === 21);
check("seeded category count", counts["product-categories"] === 9);
check("seeded application count", counts.applications === 14);
check("seeded specification count", counts.specifications === 10);
check("seeded market count", counts.markets === 4);
check("commerce offers remain empty", counts["product-offers"] === 0);
check("commerce orders remain empty", counts.orders === 0);
check("payment transactions remain empty", counts["payment-transactions"] === 0);

const productDocuments = await payload.find({ collection: "products", limit: 100, depth: 0, overrideAccess: true });
check("draft state preserved", productDocuments.docs.every((product) => product.publicationStatus === "draft" && product.seo?.indexable === false));
check("verification state preserved", productDocuments.docs.every((product) => product.verificationStatus === "catalogue-derived"));
check("product/category relationships", productDocuments.docs.every((product) => Boolean(product.primaryCategory)));
check("application relationships", productDocuments.docs.every((product) => (product.applications?.length || 0) > 0));

const staticSnapshot = await new StaticCatalogueRepository().getSnapshot();
const cmsSnapshot = await new PayloadCatalogueRepository().getSnapshot();
check("CMS product parity", cmsSnapshot.products.map((product) => product.slug).sort().join("|") === staticSnapshot.products.map((product) => product.slug).sort().join("|"));
check("CMS variant parity", cmsSnapshot.products.reduce((sum, product) => sum + product.variants.length, 0) === 21);
check("CMS category parity", cmsSnapshot.categories.map((category) => category.slug).sort().join("|") === staticSnapshot.categories.map((category) => category.slug).sort().join("|"));

let malformedRejected = false;
try { await payload.create({ collection: "products", overrideAccess: true, data: { name: "Invalid synthetic product" } as never }); }
catch { malformedRejected = true; }
check("malformed CMS product rejected", malformedRejected);

let publicEnquiryDenied = false;
try { await payload.find({ collection: "enquiries", overrideAccess: false, limit: 10 }); }
catch { publicEnquiryDenied = true; }
check("public enquiry access denied", publicEnquiryDenied);

const idempotencyKey = "25000000-0000-4000-8000-000000000025";
const repository = new PayloadEnquiryRepository();
const failingNotifier: EnquiryNotifier = { async notifySales() { throw new Error("Synthetic notifier failure"); } };
const allowingLimiter: RfqRateLimiter = { async check() { return { allowed: true, retryAfterSeconds: 0 }; } };
const service = new RfqService(repository, failingNotifier, allowingLimiter);
const now = Date.now();
const raw = { name: "Synthetic Phase 25 Enquiry", company: "Synthetic Test Company", phone: "", email: "phase25@example.invalid", businessType: "industrial-manufacturing", productSlug: products[0]!.slug, categoryId: products[0]!.primaryCategoryId, unsure: false, gradeOrViscosity: "15W-40", specification: "API CI-4", application: "Synthetic database validation", quantity: 1, quantityUnit: "units", location: "Synthetic Mlolongo Test", message: "Synthetic record for Phase 25 database validation only.", consent: true, source: "direct", sourcePage: "/request-a-quote", industrySlug: "", idempotencyKey, formStartedAt: now - 10_000, website: "" };
const context = { products: products.map(({ id, slug }) => ({ id, slug })), categoryIds: catalogueCategories.map(({ id }) => id), industrySlugs: industries.map(({ slug }) => slug) };
const first = await service.submit({ raw, context, requestFingerprint: "synthetic-phase-25", now });
const second = await service.submit({ raw, context, requestFingerprint: "synthetic-phase-25", now: now + 1 });
check("database RFQ stored", first.type === "success");
check("database idempotency returns same reference", first.type === "success" && second.type === "success" && first.referenceNumber === second.referenceNumber);
const stored = await repository.findByIdempotencyKey(idempotencyKey);
check("notifier failure retains RFQ", stored?.notificationStatus === "failed" && stored.notificationAttempts === 1);
const duplicateCount = await payload.count({ collection: "enquiries", where: { idempotencyKey: { equals: idempotencyKey } }, overrideAccess: true });
check("duplicate creates one row", duplicateCount.totalDocs === 1);

console.info("CMS database validation complete", { ...counts, syntheticEnquiries: duplicateCount.totalDocs, referenceNumber: first.type === "success" ? first.referenceNumber : null });
