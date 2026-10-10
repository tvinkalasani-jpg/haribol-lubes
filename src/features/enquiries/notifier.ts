import type { RfqRecord } from "../../types/enquiry";
import { getRfqNotificationEmail } from "./notification-config";

export type NotificationResult = { status: "sent" | "failed" | "unavailable" };

export interface EnquiryNotifier {
  notifySales(enquiry: RfqRecord): Promise<NotificationResult>;
}

export class UnavailableEnquiryNotifier implements EnquiryNotifier {
  readonly recipient = getRfqNotificationEmail();

  async notifySales(): Promise<NotificationResult> { return { status: "unavailable" }; }
}

type FetchLike = typeof fetch;

function safeMailbox(value: string | undefined): string | null {
  const normalized = value?.trim() ?? "";
  if (/\r|\n/.test(normalized)) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
}

export class PostmarkEnquiryNotifier implements EnquiryNotifier {
  constructor(
    private readonly token: string,
    private readonly sender: string,
    private readonly recipient: string,
    private readonly request: FetchLike = fetch,
  ) {}

  async notifySales(enquiry: RfqRecord): Promise<NotificationResult> {
    const replyTo = safeMailbox(enquiry.email || undefined);
    try {
      const response = await this.request("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": this.token,
        },
        body: JSON.stringify({
          From: this.sender,
          To: this.recipient,
          ...(replyTo ? { ReplyTo: replyTo } : {}),
          Subject: `Haribol quotation request ${enquiry.referenceNumber}`,
          TextBody: renderSalesNotification(enquiry),
          MessageStream: "outbound",
        }),
        signal: AbortSignal.timeout(10_000),
      });
      return { status: response.ok ? "sent" : "failed" };
    } catch {
      return { status: "failed" };
    }
  }
}

export function createEnquiryNotifier(environment: NodeJS.ProcessEnv = process.env, request: FetchLike = fetch): EnquiryNotifier {
  if (environment.EMAIL_PROVIDER !== "postmark") return new UnavailableEnquiryNotifier();
  const token = environment.EMAIL_API_KEY?.trim();
  const sender = safeMailbox(environment.EMAIL_FROM);
  const recipient = safeMailbox(environment.RFQ_NOTIFICATION_EMAIL);
  if (!token || !sender || !recipient) return new UnavailableEnquiryNotifier();
  return new PostmarkEnquiryNotifier(token, sender, recipient, request);
}

export function renderSalesNotification(enquiry: RfqRecord): string {
  return [
    `Reference: ${enquiry.referenceNumber}`, `Date: ${enquiry.createdAt}`, `Name: ${enquiry.name}`,
    `Company: ${enquiry.company || "Not supplied"}`, `Phone: ${enquiry.phone || "Not supplied"}`,
    `Email: ${enquiry.email || "Not supplied"}`, `Business type: ${enquiry.businessType || "Not supplied"}`,
    `Product: ${enquiry.productSlug || "Not selected"}`, `Category: ${enquiry.categoryId || "Not selected"}`,
    `Grade / viscosity: ${enquiry.gradeOrViscosity || "Not supplied"}`, `Specification: ${enquiry.specification || "Not supplied"}`,
    `Application: ${enquiry.application || "Not supplied"}`, `Quantity: ${enquiry.quantity ?? "Not supplied"} ${enquiry.quantityUnit}`.trim(),
    `Location: ${enquiry.location}`, `Message: ${enquiry.message || "Not supplied"}`, `Source: ${enquiry.source}`,
  ].join("\n");
}
