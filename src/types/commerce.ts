import type { PublicationStatus, VerificationStatus } from "./product";

export const currencyCodes = ["KES", "USD", "UGX", "TZS", "RWF"] as const;
export type CurrencyCode = (typeof currencyCodes)[number];

export type Money = {
  currency: CurrencyCode;
  minorAmount: number;
};

export const commerceModes = ["quote-only", "buy-online", "both"] as const;
export type CommerceMode = (typeof commerceModes)[number];

export const priceVisibilities = ["public", "login-only", "quote-only"] as const;
export type PriceVisibility = (typeof priceVisibilities)[number];

export const packUnits = ["ml", "l", "kg", "g", "unit", "other"] as const;
export type CommercePackUnit = (typeof packUnits)[number];

export const containerTypes = ["bottle", "can", "pail", "drum", "container", "other"] as const;
export type ContainerType = (typeof containerTypes)[number];

export const inventoryModes = ["tracked", "untracked", "on-enquiry"] as const;
export type InventoryMode = (typeof inventoryModes)[number];

export const commerceAvailabilityStatuses = [
  "in-stock",
  "low-stock",
  "out-of-stock",
  "available-on-enquiry",
  "preorder",
  "discontinued",
] as const;
export type CommerceAvailabilityStatus = (typeof commerceAvailabilityStatuses)[number];

export const taxClasses = ["standard", "zero-rated", "exempt", "unknown"] as const;
export type TaxClass = (typeof taxClasses)[number];

export const taxTreatments = ["unknown", "included", "excluded"] as const;
export type TaxTreatment = (typeof taxTreatments)[number];

export const promotionLabels = ["special-offer", "limited-time-price", "promotion"] as const;
export type PromotionLabel = (typeof promotionLabels)[number];

export type PromotionState = "none" | "scheduled" | "active" | "expired" | "invalid";

export type ProductOffer = {
  id: string;
  productId: string;
  variantId?: string;
  displayName: string;
  sku?: string;
  barcode?: string;
  packSize?: number;
  packUnit?: CommercePackUnit;
  containerType?: ContainerType;
  commerceMode: CommerceMode;
  active: boolean;
  currency: CurrencyCode;
  regularPriceMinor?: number;
  salePriceMinor?: number;
  priceVisibility: PriceVisibility;
  saleStart?: string;
  saleEnd?: string;
  promotionLabel?: PromotionLabel;
  inventoryMode: InventoryMode;
  stockQuantity?: number;
  lowStockThreshold?: number;
  availabilityStatus: CommerceAvailabilityStatus;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  marketIds: readonly string[];
  taxClass: TaxClass;
  taxTreatment: TaxTreatment;
  sortOrder: number;
  publicationStatus: PublicationStatus;
  verificationStatus: VerificationStatus;
};

export type ActivePrice = {
  current: Money;
  regular: Money;
  sale?: Money;
  promotionState: PromotionState;
  discountPercentage?: number;
};

export type OrderLineSnapshot = {
  offerId: string;
  productName: string;
  variantName?: string;
  sku?: string;
  packDescription?: string;
  unitPrice: Money;
  regularPrice?: Money;
  discountMinor?: number;
  taxClass: TaxClass;
  taxTreatment: TaxTreatment;
  quantity: number;
};
