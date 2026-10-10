import { randomBytes } from "node:crypto";

import type { Cart, CheckoutInput, CheckoutOffer, OrderDraft } from "../../types/checkout";
import { resolveCart, type CartResolutionOptions } from "./cart";
import { calculateOrderTotals, snapshotOrderLines } from "./totals";
import { validateCheckoutInput } from "./validation";

export type StoredOrder = OrderDraft & { id: string };

export type OrderRepository = {
  findByIdempotencyKey(key: string): Promise<StoredOrder | null>;
  create(order: OrderDraft): Promise<StoredOrder>;
};

export function createOrderReference(now = new Date(), random = randomBytes(4).toString("hex").slice(0, 6)): string {
  return `ORD-${now.getUTCFullYear()}-${random.toUpperCase()}`;
}

export type CreateOrderInput = {
  cart: Cart;
  checkout: CheckoutInput;
  idempotencyKey: string;
};

export type CreateOrderDependencies = {
  offers: readonly CheckoutOffer[];
  resolution: CartResolutionOptions;
  repository: OrderRepository;
  now?: Date;
  createReference?: () => string;
};

export async function createOrderDraft(input: CreateOrderInput, dependencies: CreateOrderDependencies): Promise<StoredOrder> {
  const key = input.idempotencyKey.trim();
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(key)) throw new Error("A valid checkout idempotency key is required.");
  const existing = await dependencies.repository.findByIdempotencyKey(key);
  if (existing) return existing;
  const validationErrors = validateCheckoutInput(input.checkout);
  if (Object.keys(validationErrors).length > 0) throw new Error("Checkout details are invalid.");
  const resolved = resolveCart(
    { lines: input.cart.lines.map(({ offerId, quantity }) => ({ offerId: String(offerId), quantity: Number(quantity) })) },
    dependencies.offers,
    dependencies.resolution,
  );
  if (resolved.issues.length > 0 || resolved.lines.length !== input.cart.lines.length) throw new Error("Cart could not be resolved for checkout.");
  const lines = snapshotOrderLines(resolved.lines);
  const totals = calculateOrderTotals(lines, 0);
  const now = dependencies.now ?? new Date();
  return dependencies.repository.create({
    referenceNumber: dependencies.createReference?.() ?? createOrderReference(now),
    idempotencyKey: key,
    status: "pending-payment",
    paymentStatus: "unpaid",
    customer: {
      fullName: input.checkout.fullName.trim(),
      company: input.checkout.company?.trim() || undefined,
      phone: input.checkout.phone.trim(),
      email: input.checkout.email?.trim().toLowerCase() || undefined,
      deliveryLocation: input.checkout.deliveryLocation.trim(),
      deliveryInstructions: input.checkout.deliveryInstructions?.trim() || undefined,
    },
    lines,
    totals,
    source: "website-checkout",
    createdAt: now.toISOString(),
  });
}

const allowedOrderTransitions: Record<OrderDraft["status"], readonly OrderDraft["status"][]> = {
  "pending-payment": ["payment-processing", "cancelled", "payment-failed"],
  "payment-processing": ["paid", "payment-failed", "cancelled"],
  paid: ["processing", "refunded"],
  processing: ["ready", "cancelled", "refunded"],
  ready: ["completed", "cancelled", "refunded"],
  completed: ["refunded"],
  cancelled: [],
  "payment-failed": ["payment-processing", "cancelled"],
  refunded: [],
};

export function canTransitionOrderStatus(from: OrderDraft["status"], to: OrderDraft["status"]): boolean {
  return from === to || allowedOrderTransitions[from].includes(to);
}
