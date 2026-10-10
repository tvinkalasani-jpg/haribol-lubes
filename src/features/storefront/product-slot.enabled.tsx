import { ProductCommercePanel } from "@/components/commerce/product-commerce-panel";
import { storefrontTestOffers } from "@/data/commerce/storefront-fixtures";

import type { StorefrontProductSlotProps } from "./product-slot.types";

export function StorefrontProductSlot({ productSlug, quotePath }: StorefrontProductSlotProps) {
  if (productSlug !== "mastermax-engine-oils") return null;
  return <ProductCommercePanel offers={storefrontTestOffers} quotePath={quotePath} />;
}
