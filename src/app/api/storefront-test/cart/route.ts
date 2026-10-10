import { NextResponse } from "next/server";

import { storefrontTestOffers } from "@/data/commerce/storefront-fixtures";
import { isStorefrontTestMode } from "@/features/storefront/config";
import { resolveCart } from "@/lib/checkout/cart";
import type { Cart } from "@/types/checkout";

export async function POST(request: Request) {
  if (!isStorefrontTestMode()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const lines = input && typeof input === "object" && Array.isArray((input as { lines?: unknown }).lines) ? (input as { lines: Cart["lines"] }).lines : [];
  return NextResponse.json(resolveCart({ lines }, storefrontTestOffers, { commerceEnabled: true, marketId: "ke", activeMarketIds: ["ke"] }));
}
