import { randomBytes } from "node:crypto";

import { getPayload } from "payload";

import config from "@payload-config";
import { assertCmsEnvironment } from "@/cms/environment";
import type { RfqNotificationStatus, RfqRecord } from "@/types/enquiry";

import { EnquiryStorageError, type EnquiryRepository, type NewRfqRecord } from "./repository";

type EnquiryDocument = Record<string, unknown> & { id: string | number; createdAt: string; updatedAt: string };

function toRecord(document: EnquiryDocument): RfqRecord {
  const metadata = (document.metadata || {}) as RfqRecord["metadata"];
  return {
    id: String(document.id), referenceNumber: String(document.referenceNumber), createdAt: document.createdAt, updatedAt: document.updatedAt,
    status: document.status as RfqRecord["status"], name: String(document.name), company: String(document.company || ""), phone: String(document.phone || ""), email: String(document.email || ""), businessType: (document.businessType || "") as RfqRecord["businessType"],
    source: document.source as RfqRecord["source"], sourcePage: String(document.sourcePage), productId: typeof document.productIdSnapshot === "string" ? document.productIdSnapshot : null, productSlug: typeof document.productSlugSnapshot === "string" ? document.productSlugSnapshot : null, categoryId: String(document.categorySnapshot || ""), unsure: Boolean(document.unsure), gradeOrViscosity: String(document.gradeOrViscosity || ""), specification: String(document.specification || ""), application: String(document.application || ""), quantity: typeof document.quantity === "number" ? document.quantity : null, quantityUnit: (document.quantityUnit || "") as RfqRecord["quantityUnit"], location: String(document.location), message: String(document.message || ""), industrySlug: String((metadata as Record<string, unknown>).industryId || ""), idempotencyKey: String(document.idempotencyKey), consentRecordedAt: String(document.consentRecordedAt), notificationStatus: document.notificationStatus as RfqNotificationStatus, notificationAttempts: Number(document.notificationAttempts || 0), metadata,
  };
}

export class PayloadEnquiryRepository implements EnquiryRepository {
  private async client() { assertCmsEnvironment(); return getPayload({ config }); }

  async findById(id: string): Promise<RfqRecord | null> {
    try { return toRecord(await (await this.client()).findByID({ collection: "enquiries", id, overrideAccess: true }) as unknown as EnquiryDocument); }
    catch { return null; }
  }

  async findByIdempotencyKey(key: string): Promise<RfqRecord | null> {
    const result = await (await this.client()).find({ collection: "enquiries", where: { idempotencyKey: { equals: key } }, limit: 1, overrideAccess: true });
    return result.docs[0] ? toRecord(result.docs[0] as unknown as EnquiryDocument) : null;
  }

  async create(input: NewRfqRecord): Promise<RfqRecord> {
    const existing = await this.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return existing;
    const payload = await this.client();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const referenceNumber = `RFQ-${new Date().getUTCFullYear()}-${randomBytes(4).toString("hex").slice(0, 6).toUpperCase()}`;
        const productResult = input.productSlug ? await payload.find({ collection: "products", where: { slug: { equals: input.productSlug } }, limit: 1, overrideAccess: true }) : null;
        const document = await payload.create({ collection: "enquiries", overrideAccess: true, data: {
          referenceNumber, idempotencyKey: input.idempotencyKey, status: input.status, name: input.name, company: input.company, phone: input.phone, email: input.email || undefined, businessType: input.businessType || undefined, source: input.source, sourcePage: input.sourcePage,
          product: productResult?.docs[0]?.id, productIdSnapshot: input.productId || undefined, productSlugSnapshot: input.productSlug || undefined, categorySnapshot: input.categoryId || undefined, gradeOrViscosity: input.gradeOrViscosity || undefined, specification: input.specification || undefined, application: input.application || undefined, quantity: input.quantity ?? undefined, quantityUnit: input.quantityUnit || undefined, location: input.location, message: input.message || undefined, consentRecordedAt: input.consentRecordedAt, notificationStatus: input.notificationStatus, notificationAttempts: input.notificationAttempts, metadata: input.metadata,
        } });
        return toRecord(document as unknown as EnquiryDocument);
      } catch (error) {
        const duplicate = await this.findByIdempotencyKey(input.idempotencyKey);
        if (duplicate) return duplicate;
        if (attempt === 4) throw new EnquiryStorageError(error instanceof Error ? error.message : undefined);
      }
    }
    throw new EnquiryStorageError();
  }

  async updateNotificationStatus(id: string, status: RfqNotificationStatus, attempts: number): Promise<RfqRecord> {
    try { return toRecord(await (await this.client()).update({ collection: "enquiries", id, overrideAccess: true, data: { notificationStatus: status, notificationAttempts: attempts } }) as unknown as EnquiryDocument); }
    catch (error) { throw new EnquiryStorageError(error instanceof Error ? error.message : undefined); }
  }
}
