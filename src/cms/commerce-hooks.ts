import type { CollectionBeforeChangeHook } from "payload";

import { canTransitionOrderStatus } from "@/lib/checkout/orders";
import { canTransitionPaymentStatus } from "@/lib/checkout/payments";
import type { OrderStatus, PaymentStatus } from "@/types/checkout";

export const validateOrderStatusTransition: CollectionBeforeChangeHook = ({ data, operation, originalDoc }) => {
  if (operation !== "update") return data;
  if (originalDoc?.status && data.status && !canTransitionOrderStatus(originalDoc.status as OrderStatus, data.status as OrderStatus)) {
    throw new Error(`Order status cannot move from ${String(originalDoc.status)} to ${String(data.status)}.`);
  }
  if (originalDoc?.paymentStatus && data.paymentStatus && !canTransitionPaymentStatus(originalDoc.paymentStatus as PaymentStatus, data.paymentStatus as PaymentStatus)) {
    throw new Error(`Payment status cannot move from ${String(originalDoc.paymentStatus)} to ${String(data.paymentStatus)}.`);
  }
  return data;
};

export const validatePaymentStatusTransition: CollectionBeforeChangeHook = ({ data, operation, originalDoc }) => {
  if (operation !== "update" || !originalDoc?.status || !data.status) return data;
  if (!canTransitionPaymentStatus(originalDoc.status as PaymentStatus, data.status as PaymentStatus)) {
    throw new Error(`Payment status cannot move from ${String(originalDoc.status)} to ${String(data.status)}.`);
  }
  return data;
};
