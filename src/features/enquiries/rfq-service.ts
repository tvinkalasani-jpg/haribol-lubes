import type { RfqOutcome } from "../../types/enquiry";
import { validateRfqPayload, type RfqValidationContext } from "../../lib/validation/rfq";
import type { EnquiryNotifier } from "./notifier";
import type { EnquiryRepository } from "./repository";
import type { RfqRateLimiter } from "./rate-limit";

type SubmitOptions = { raw: unknown; context: RfqValidationContext; requestFingerprint: string; now?: number };

export class RfqService {
  constructor(private repository: EnquiryRepository, private notifier: EnquiryNotifier, private rateLimiter: RfqRateLimiter) {}

  async submit({ raw, context, requestFingerprint, now = Date.now() }: SubmitOptions): Promise<RfqOutcome> {
    const validation = validateRfqPayload(raw, context, now);
    if (!validation.success) return { type: "validation_error", message: "Check the highlighted fields and try again.", errors: validation.errors };
    const rate = await this.rateLimiter.check(requestFingerprint, now);
    if (!rate.allowed) return { type: "rate_limited", message: "Too many quotation requests were received. Please wait and try again.", retryAfterSeconds: rate.retryAfterSeconds };

    try {
      const duplicate = await this.repository.findByIdempotencyKey(validation.data.idempotencyKey);
      if (duplicate) return { type: "success", referenceNumber: duplicate.referenceNumber };
      const timestamp = new Date(now).toISOString();
      const stored = await this.repository.create({
        ...validation.data,
        productId: validation.productId,
        productSlug: validation.productId ? validation.data.productSlug : null,
        status: "received",
        consentRecordedAt: timestamp,
        notificationStatus: "pending",
        notificationAttempts: 0,
        metadata: { industryId: validation.data.industrySlug || null, requestFingerprint },
      });
      let notificationStatus: "sent" | "failed" | "unavailable" = "failed";
      try { notificationStatus = (await this.notifier.notifySales(stored)).status; }
      catch { notificationStatus = "failed"; }
      try { await this.repository.updateNotificationStatus(stored.id, notificationStatus, 1); }
      catch { /* The original stored enquiry remains the source of truth. */ }
      console.info("RFQ received", { referenceNumber: stored.referenceNumber, status: stored.status, notificationStatus });
      return { type: "success", referenceNumber: stored.referenceNumber };
    } catch {
      console.error("RFQ storage failed", { status: "storage_error" });
      return { type: "storage_error", message: "We couldn’t record your quotation request. Please try again." };
    }
  }
}
