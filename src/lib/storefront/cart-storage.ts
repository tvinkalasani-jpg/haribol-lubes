import type { Cart, CartLineInput } from "@/types/checkout";

export const storefrontCartStorageKey = "haribol-storefront-cart-v1";

function isLine(value: unknown): value is CartLineInput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.offerId === "string" && candidate.offerId.length > 0 && Number.isSafeInteger(candidate.quantity) && Number(candidate.quantity) > 0;
}

export function parseStoredCart(value: string | null): Cart {
  if (!value) return { lines: [] };
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { lines?: unknown }).lines)) return { lines: [] };
    const lines = (parsed as { lines: unknown[] }).lines.filter(isLine).map(({ offerId, quantity }) => ({ offerId, quantity }));
    return { lines };
  } catch {
    return { lines: [] };
  }
}

export function serializeCart(cart: Cart): string {
  return JSON.stringify({ lines: cart.lines.map(({ offerId, quantity }) => ({ offerId, quantity })) });
}

export function countCartUnits(cart: Cart): number {
  return cart.lines.reduce((sum, line) => sum + line.quantity, 0);
}
