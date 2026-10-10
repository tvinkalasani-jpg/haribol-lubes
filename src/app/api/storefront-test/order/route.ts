import { NextResponse } from "next/server";

import { storefrontTestOffers } from "@/data/commerce/storefront-fixtures";
import { isStorefrontTestMode } from "@/features/storefront/config";
import { createOrderDraft, type OrderRepository, type StoredOrder } from "@/lib/checkout/orders";
import type { Cart, CheckoutInput } from "@/types/checkout";

const testOrders = new Map<string, StoredOrder>();
const repository: OrderRepository = {
  async findByIdempotencyKey(key) { return testOrders.get(key) ?? null; },
  async create(order) { const stored = { ...order, id: `synthetic-${testOrders.size + 1}` }; testOrders.set(order.idempotencyKey, stored); return stored; },
};

type RequestBody = { cart?: Cart; checkout?: CheckoutInput; idempotencyKey?: string };

export async function POST(request: Request) {
  if (!isStorefrontTestMode()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  let body: RequestBody;
  try { body = await request.json() as RequestBody; } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  if (!body.cart || !body.checkout || !body.idempotencyKey) return NextResponse.json({ error: "Complete the required checkout fields." }, { status: 400 });
  try {
    const order = await createOrderDraft({ cart: body.cart, checkout: body.checkout, idempotencyKey: body.idempotencyKey }, { offers: storefrontTestOffers, resolution: { commerceEnabled: true, marketId: "ke", activeMarketIds: ["ke"] }, repository, createReference: () => `ORD-TEST-${crypto.randomUUID().slice(0, 6).toUpperCase()}` });
    return NextResponse.json({ referenceNumber: order.referenceNumber, paymentStatus: order.paymentStatus, totals: order.totals });
  } catch (reason) {
    return NextResponse.json({ error: reason instanceof Error ? reason.message : "The test order could not be created." }, { status: 400 });
  }
}
