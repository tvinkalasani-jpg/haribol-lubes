import type { CheckoutOffer } from "@/types/checkout";

const common = {
  productId: "mastermax-engine-oils",
  variantId: "15w-40-api-ci-4",
  productName: "Synthetic Storefront Product",
  variantName: "Synthetic 15W-40 test formulation",
  active: true,
  currency: "KES" as const,
  priceVisibility: "public" as const,
  inventoryMode: "tracked" as const,
  stockQuantity: 24,
  availabilityStatus: "in-stock" as const,
  marketIds: ["ke"],
  taxClass: "unknown" as const,
  taxTreatment: "unknown" as const,
  sortOrder: 100,
  publicationStatus: "published" as const,
  verificationStatus: "needs-review" as const,
};

export const storefrontTestOffers: readonly CheckoutOffer[] = [
  { ...common, id: "synthetic-1l", displayName: "Synthetic 1 L Bottle", sku: "TEST-1L", packSize: 1, packUnit: "l", containerType: "bottle", commerceMode: "buy-online", regularPriceMinor: 250_000, minimumOrderQuantity: 1, maximumOrderQuantity: 12 },
  { ...common, id: "synthetic-5l-sale", displayName: "Synthetic 5 L Container", sku: "TEST-5L", packSize: 5, packUnit: "l", containerType: "container", commerceMode: "both", regularPriceMinor: 500_000, salePriceMinor: 425_000, saleStart: "2026-01-01T00:00:00.000Z", saleEnd: "2027-01-01T00:00:00.000Z", promotionLabel: "limited-time-price", minimumOrderQuantity: 1, maximumOrderQuantity: 8 },
  { ...common, id: "synthetic-20l-out", displayName: "Synthetic 20 L Pail", sku: "TEST-20L", packSize: 20, packUnit: "l", containerType: "pail", commerceMode: "buy-online", regularPriceMinor: 1_500_000, stockQuantity: 0, availabilityStatus: "out-of-stock", minimumOrderQuantity: 1, maximumOrderQuantity: 2 },
  { ...common, id: "synthetic-moq", displayName: "Synthetic MOQ Test Pack", sku: "TEST-MOQ", packSize: 4, packUnit: "unit", containerType: "container", commerceMode: "buy-online", regularPriceMinor: 900_000, availabilityStatus: "low-stock", minimumOrderQuantity: 4, maximumOrderQuantity: 8 },
  { ...common, id: "synthetic-quote", displayName: "Synthetic Bulk / Quote Only", sku: undefined, packSize: 200, packUnit: "l", containerType: "drum", commerceMode: "quote-only", regularPriceMinor: undefined, priceVisibility: "quote-only", inventoryMode: "on-enquiry", stockQuantity: undefined, availabilityStatus: "available-on-enquiry", minimumOrderQuantity: undefined, maximumOrderQuantity: undefined },
] as const;

export const storefrontPromotionFixtures: readonly CheckoutOffer[] = [
  ...storefrontTestOffers,
  { ...common, id: "synthetic-future-sale", displayName: "Synthetic Future Promotion", commerceMode: "buy-online", regularPriceMinor: 600_000, salePriceMinor: 500_000, saleStart: "2028-01-01T00:00:00.000Z", saleEnd: "2028-02-01T00:00:00.000Z" },
  { ...common, id: "synthetic-expired-sale", displayName: "Synthetic Expired Promotion", commerceMode: "buy-online", regularPriceMinor: 600_000, salePriceMinor: 500_000, saleStart: "2025-01-01T00:00:00.000Z", saleEnd: "2025-02-01T00:00:00.000Z" },
];
