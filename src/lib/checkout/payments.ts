import type { OrderDraft, PaymentStatus, PaymentTransactionDraft, PaymentProvider } from "../../types/checkout";

const allowedPaymentTransitions: Record<PaymentStatus, readonly PaymentStatus[]> = {
  unpaid: ["pending", "cancelled"],
  pending: ["paid", "failed", "cancelled"],
  paid: ["partially-refunded", "refunded"],
  failed: ["pending", "cancelled"],
  cancelled: [],
  "partially-refunded": ["refunded"],
  refunded: [],
};

export function canTransitionPaymentStatus(from: PaymentStatus, to: PaymentStatus): boolean {
  return from === to || allowedPaymentTransitions[from].includes(to);
}

export function createPaymentTransactionDraft(orderId: string, order: Pick<OrderDraft, "totals">, provider: PaymentProvider): PaymentTransactionDraft {
  if (!orderId.trim()) throw new Error("Payment transaction requires an order identifier.");
  return {
    orderId,
    provider,
    amountMinor: order.totals.grandTotalMinor,
    currency: order.totals.currency,
    status: "unpaid",
  };
}

export type PaymentEvent = {
  provider: PaymentProvider;
  providerReference: string;
  status: PaymentStatus;
  rawEventReference?: string;
};

export function processPaymentEvent(): never {
  throw new Error("Provider event verification must be implemented by the selected payment integration before activation.");
}
