import type {
  CommercePackUnit,
  ContainerType,
  CurrencyCode,
  ProductOffer,
  TaxClass,
  TaxTreatment,
} from "./commerce";

export type CartLineInput = {
  offerId: string;
  quantity: number;
};

export type Cart = {
  lines: readonly CartLineInput[];
};

export type CheckoutOffer = ProductOffer & {
  productName: string;
  variantName?: string;
};

export type ResolvedCartLine = {
  offerId: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  offerDisplayName: string;
  sku?: string;
  packSize?: number;
  packUnit?: CommercePackUnit;
  containerType?: ContainerType;
  quantity: number;
  minimumOrderQuantity: number;
  maximumOrderQuantity?: number;
  currency: CurrencyCode;
  regularUnitPriceMinor: number;
  unitPriceMinor: number;
  unitDiscountMinor: number;
  taxClass: TaxClass;
  taxTreatment: TaxTreatment;
};

export type CartResolutionIssueCode =
  | "commerce-disabled"
  | "offer-not-found"
  | "offer-unavailable"
  | "offer-not-buyable"
  | "market-unavailable"
  | "price-unavailable"
  | "invalid-quantity"
  | "below-minimum"
  | "above-maximum"
  | "insufficient-stock";

export type CartResolutionIssue = {
  offerId: string;
  code: CartResolutionIssueCode;
  message: string;
};

export type ResolvedCart = {
  lines: readonly ResolvedCartLine[];
  issues: readonly CartResolutionIssue[];
};

export type CheckoutInput = {
  fullName: string;
  company?: string;
  phone: string;
  email?: string;
  deliveryLocation: string;
  deliveryInstructions?: string;
};

export const orderStatuses = [
  "pending-payment",
  "payment-processing",
  "paid",
  "processing",
  "ready",
  "completed",
  "cancelled",
  "payment-failed",
  "refunded",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const paymentStatuses = ["unpaid", "pending", "paid", "failed", "cancelled", "partially-refunded", "refunded"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const paymentProviders = ["mpesa", "card", "bank", "other"] as const;
export type PaymentProvider = (typeof paymentProviders)[number];

export type CheckoutOrderLineSnapshot = ResolvedCartLine & {
  lineSubtotalMinor: number;
  lineDiscountMinor: number;
  lineTaxMinor: number;
  lineTotalMinor: number;
};

export type OrderTotals = {
  currency: CurrencyCode;
  subtotalMinor: number;
  discountTotalMinor: number;
  taxTotalMinor: number;
  deliveryTotalMinor: number;
  grandTotalMinor: number;
};

export type OrderDraft = {
  referenceNumber: string;
  idempotencyKey: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customer: CheckoutInput;
  lines: readonly CheckoutOrderLineSnapshot[];
  totals: OrderTotals;
  source: "website-checkout";
  createdAt: string;
};

export type PaymentTransactionDraft = {
  orderId: string;
  provider: PaymentProvider;
  amountMinor: number;
  currency: CurrencyCode;
  status: PaymentStatus;
};

export type SafeCommerceAnalyticsEvent =
  | "cart_item_added"
  | "cart_item_removed"
  | "cart_quantity_updated"
  | "checkout_started"
  | "order_created"
  | "payment_started"
  | "payment_completed"
  | "payment_failed";
