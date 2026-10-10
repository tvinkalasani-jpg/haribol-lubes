import type { ProductPageData } from "@/features/catalogue/product-page-data";
import { siteConfig } from "@/config/site";
import { getAvailability, getDisplayPrice } from "@/lib/commerce/offers";
import { minorToMajor } from "@/lib/commerce/money";
import type { ProductOffer } from "@/types/commerce";

export type ProductSchemaCandidate = {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  brand: {
    "@type": "Brand";
    name: string;
  };
  description: string;
  image?: readonly string[];
};

export type OfferSchemaCandidate = {
  "@type": "Offer";
  price: number;
  priceCurrency: string;
  availability: string;
  sku?: string;
};

const schemaAvailability = {
  "in-stock": "https://schema.org/InStock",
  "low-stock": "https://schema.org/LimitedAvailability",
  "out-of-stock": "https://schema.org/OutOfStock",
  "available-on-enquiry": "https://schema.org/LimitedAvailability",
  preorder: "https://schema.org/PreOrder",
  discontinued: "https://schema.org/Discontinued",
} as const;

/**
 * Prepares a future Offer node without emitting it. Commerce, publication,
 * price visibility and live promotion timing must all permit disclosure.
 */
export function createOfferSchemaCandidate(
  offer: ProductOffer,
  now = new Date(),
): OfferSchemaCandidate | undefined {
  if (!siteConfig.commerceEnabled || !offer.active || offer.publicationStatus !== "published") {
    return undefined;
  }
  const price = getDisplayPrice(offer, now);
  if (!price) return undefined;
  return {
    "@type": "Offer",
    price: minorToMajor(price.current),
    priceCurrency: price.current.currency,
    availability: schemaAvailability[getAvailability(offer)],
    sku: offer.sku,
  };
}

/**
 * Prepares the verified subset available for future Product JSON-LD emission.
 * It deliberately excludes price, availability, ratings, SKU and identifiers.
 */
export function createProductSchemaCandidate(
  data: ProductPageData,
): ProductSchemaCandidate | undefined {
  if (!data.indexable) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.product.name,
    brand: {
      "@type": "Brand",
      name: data.brand.name,
    },
    description: data.product.description ?? data.product.shortDescription,
    image: data.product.images.length
      ? data.product.images.map((image) => image.src)
      : undefined,
  };
}
