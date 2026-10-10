import { siteConfig } from "../../config/site";
import type {
  ActivePrice,
  CommerceAvailabilityStatus,
  ProductOffer,
  PromotionState,
} from "../../types/commerce";

import { isValidMinorAmount } from "./money";

function timestamp(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function calculateDiscountPercentage(regularPriceMinor: number, salePriceMinor: number): number {
  if (!isValidMinorAmount(regularPriceMinor) || !isValidMinorAmount(salePriceMinor) || salePriceMinor >= regularPriceMinor) return 0;
  return Math.round(((regularPriceMinor - salePriceMinor) / regularPriceMinor) * 100);
}

export function getPromotionState(offer: Pick<ProductOffer, "regularPriceMinor" | "salePriceMinor" | "saleStart" | "saleEnd">, now = new Date()): PromotionState {
  if (offer.salePriceMinor === undefined) return "none";
  if (!isValidMinorAmount(offer.regularPriceMinor) || !isValidMinorAmount(offer.salePriceMinor) || offer.salePriceMinor >= offer.regularPriceMinor) return "invalid";
  const start = timestamp(offer.saleStart);
  const end = timestamp(offer.saleEnd);
  if ((offer.saleStart && start === undefined) || (offer.saleEnd && end === undefined) || (start !== undefined && end !== undefined && end < start)) return "invalid";
  const current = now.getTime();
  if (start !== undefined && current < start) return "scheduled";
  if (end !== undefined && current > end) return "expired";
  return "active";
}

export function getActivePrice(offer: ProductOffer, now = new Date()): ActivePrice | undefined {
  if (!isValidMinorAmount(offer.regularPriceMinor)) return undefined;
  const regular = { currency: offer.currency, minorAmount: offer.regularPriceMinor } as const;
  const promotionState = getPromotionState(offer, now);
  if (promotionState !== "active" || !isValidMinorAmount(offer.salePriceMinor)) return { current: regular, regular, promotionState };
  const sale = { currency: offer.currency, minorAmount: offer.salePriceMinor } as const;
  return { current: sale, regular, sale, promotionState, discountPercentage: calculateDiscountPercentage(offer.regularPriceMinor, offer.salePriceMinor) };
}

export function getDisplayPrice(offer: ProductOffer, now = new Date()): ActivePrice | undefined {
  if (offer.priceVisibility !== "public") return undefined;
  return getActivePrice(offer, now);
}

export function getAvailability(offer: ProductOffer): CommerceAvailabilityStatus {
  if (!offer.active || offer.publicationStatus !== "published") return "discontinued";
  if (offer.inventoryMode === "on-enquiry") return "available-on-enquiry";
  if (offer.inventoryMode === "tracked") {
    if (!Number.isSafeInteger(offer.stockQuantity) || Number(offer.stockQuantity) <= 0) return "out-of-stock";
    if (Number.isSafeInteger(offer.lowStockThreshold) && Number(offer.stockQuantity) <= Number(offer.lowStockThreshold)) return "low-stock";
    return "in-stock";
  }
  return offer.availabilityStatus;
}

export function getSellableOffersForProduct(
  offers: readonly ProductOffer[],
  productId: string,
  marketId: string,
  activeMarketIds: readonly string[],
): readonly ProductOffer[] {
  if (!siteConfig.commerceEnabled || !activeMarketIds.includes(marketId)) return [];
  return offers
    .filter((offer) => offer.productId === productId && offer.marketIds.includes(marketId) && offer.active && offer.publicationStatus === "published" && offer.commerceMode !== "quote-only")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
