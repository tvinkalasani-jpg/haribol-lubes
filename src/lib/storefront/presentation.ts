import { formatMoney } from "../commerce/money";
import { getActivePrice } from "../commerce/offers";
import type { CheckoutOffer, ResolvedCartLine } from "@/types/checkout";
import type { CommerceAvailabilityStatus, PromotionLabel } from "@/types/commerce";

export const availabilityLabels: Record<CommerceAvailabilityStatus, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
  "available-on-enquiry": "Availability on enquiry",
  preorder: "Pre-order / Coming soon",
  discontinued: "No longer available",
};

export const promotionLabelText: Record<PromotionLabel, string> = {
  "special-offer": "Special Offer",
  "limited-time-price": "Limited-Time Price",
  promotion: "Promotion",
};

export type OfferDisplayModel = {
  offerId: string;
  name: string;
  price?: string;
  regularPrice?: string;
  discount?: string;
  promotionLabel?: string;
  availability: string;
  canAddToCart: boolean;
  showQuote: boolean;
  minimum: number;
  maximum?: number;
};

export function createOfferDisplayModel(offer: CheckoutOffer, now = new Date()): OfferDisplayModel {
  const activePrice = offer.priceVisibility === "public" ? getActivePrice(offer, now) : undefined;
  const canAddToCart = offer.active && offer.publicationStatus === "published" && (offer.commerceMode === "buy-online" || offer.commerceMode === "both") && offer.inventoryMode !== "on-enquiry" && offer.availabilityStatus !== "out-of-stock" && offer.availabilityStatus !== "discontinued" && Boolean(activePrice);
  const activePromotion = activePrice?.promotionState === "active" && activePrice.sale;
  return {
    offerId: offer.id,
    name: offer.displayName,
    price: activePrice ? formatMoney(activePrice.current) : undefined,
    regularPrice: activePromotion ? formatMoney(activePrice.regular) : undefined,
    discount: activePromotion && activePrice.discountPercentage ? `${activePrice.discountPercentage}% OFF` : undefined,
    promotionLabel: activePromotion && offer.promotionLabel ? promotionLabelText[offer.promotionLabel] : undefined,
    availability: availabilityLabels[offer.availabilityStatus],
    canAddToCart,
    showQuote: offer.commerceMode === "quote-only" || offer.commerceMode === "both" || !canAddToCart,
    minimum: offer.minimumOrderQuantity ?? 1,
    maximum: offer.maximumOrderQuantity,
  };
}

export function detectPriceUpdates(previous: readonly ResolvedCartLine[], current: readonly ResolvedCartLine[]): string[] {
  return current.filter((line) => previous.some((old) => old.offerId === line.offerId && old.unitPriceMinor !== line.unitPriceMinor)).map((line) => line.offerId);
}
