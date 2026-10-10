import { getActivePrice } from "../commerce/offers";
import type {
  Cart,
  CartLineInput,
  CartResolutionIssue,
  CheckoutOffer,
  ResolvedCart,
  ResolvedCartLine,
} from "../../types/checkout";

export function isValidCartQuantity(quantity: unknown): quantity is number {
  return Number.isSafeInteger(quantity) && Number(quantity) > 0;
}

export function addCartLine(cart: Cart, input: CartLineInput): Cart {
  if (!input.offerId.trim() || !isValidCartQuantity(input.quantity)) throw new Error("Cart quantity must be a positive whole number.");
  const existing = cart.lines.find((line) => line.offerId === input.offerId);
  if (!existing) return { lines: [...cart.lines, { offerId: input.offerId, quantity: input.quantity }] };
  return updateCartQuantity(cart, input.offerId, existing.quantity + input.quantity);
}

export function updateCartQuantity(cart: Cart, offerId: string, quantity: number): Cart {
  if (!isValidCartQuantity(quantity)) throw new Error("Cart quantity must be a positive whole number.");
  if (!cart.lines.some((line) => line.offerId === offerId)) throw new Error("Cart line was not found.");
  return { lines: cart.lines.map((line) => line.offerId === offerId ? { offerId, quantity } : line) };
}

export function removeCartLine(cart: Cart, offerId: string): Cart {
  return { lines: cart.lines.filter((line) => line.offerId !== offerId) };
}

export type CartResolutionOptions = {
  commerceEnabled: boolean;
  marketId: string;
  activeMarketIds: readonly string[];
  now?: Date;
};

function issue(offerId: string, code: CartResolutionIssue["code"], message: string): CartResolutionIssue {
  return { offerId, code, message };
}

export function resolveCart(cart: Cart, offers: readonly CheckoutOffer[], options: CartResolutionOptions): ResolvedCart {
  const lines: ResolvedCartLine[] = [];
  const issues: CartResolutionIssue[] = [];
  for (const submitted of cart.lines) {
    const offerId = String(submitted.offerId);
    if (!options.commerceEnabled) {
      issues.push(issue(offerId, "commerce-disabled", "Online purchasing is not enabled."));
      continue;
    }
    if (!isValidCartQuantity(submitted.quantity)) {
      issues.push(issue(offerId, "invalid-quantity", "Quantity must be a positive whole number."));
      continue;
    }
    const offer = offers.find((candidate) => candidate.id === offerId);
    if (!offer) {
      issues.push(issue(offerId, "offer-not-found", "The selected offer no longer exists."));
      continue;
    }
    if (!offer.active || offer.publicationStatus !== "published") {
      issues.push(issue(offerId, "offer-unavailable", "The selected offer is not available."));
      continue;
    }
    if (offer.commerceMode !== "buy-online" && offer.commerceMode !== "both") {
      issues.push(issue(offerId, "offer-not-buyable", "The selected offer requires a quotation."));
      continue;
    }
    if (!options.activeMarketIds.includes(options.marketId) || !offer.marketIds.includes(options.marketId)) {
      issues.push(issue(offerId, "market-unavailable", "The selected offer is unavailable in this market."));
      continue;
    }
    if (offer.inventoryMode === "on-enquiry" || offer.availabilityStatus === "available-on-enquiry" || offer.availabilityStatus === "out-of-stock" || offer.availabilityStatus === "discontinued") {
      issues.push(issue(offerId, "offer-unavailable", "The selected offer cannot currently be purchased online."));
      continue;
    }
    if (offer.minimumOrderQuantity !== undefined && submitted.quantity < offer.minimumOrderQuantity) {
      issues.push(issue(offerId, "below-minimum", `Minimum order quantity is ${offer.minimumOrderQuantity}.`));
      continue;
    }
    if (offer.maximumOrderQuantity !== undefined && submitted.quantity > offer.maximumOrderQuantity) {
      issues.push(issue(offerId, "above-maximum", `Maximum order quantity is ${offer.maximumOrderQuantity}.`));
      continue;
    }
    if (offer.inventoryMode === "tracked" && (!Number.isSafeInteger(offer.stockQuantity) || submitted.quantity > Number(offer.stockQuantity))) {
      issues.push(issue(offerId, "insufficient-stock", "Requested quantity is not currently available."));
      continue;
    }
    const price = getActivePrice(offer, options.now);
    if (!price) {
      issues.push(issue(offerId, "price-unavailable", "The selected offer has no valid price."));
      continue;
    }
    lines.push({
      offerId: offer.id,
      productId: offer.productId,
      variantId: offer.variantId,
      productName: offer.productName,
      variantName: offer.variantName,
      offerDisplayName: offer.displayName,
      sku: offer.sku,
      packSize: offer.packSize,
      packUnit: offer.packUnit,
      containerType: offer.containerType,
      quantity: submitted.quantity,
      minimumOrderQuantity: offer.minimumOrderQuantity ?? 1,
      maximumOrderQuantity: offer.maximumOrderQuantity,
      currency: offer.currency,
      regularUnitPriceMinor: price.regular.minorAmount,
      unitPriceMinor: price.current.minorAmount,
      unitDiscountMinor: price.regular.minorAmount - price.current.minorAmount,
      taxClass: offer.taxClass,
      taxTreatment: offer.taxTreatment,
    });
  }
  return { lines, issues };
}
