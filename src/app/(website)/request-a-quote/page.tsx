import type { Metadata } from "next";

import { RfqPage } from "@/components/forms/rfq-page";
import { catalogueCategories } from "@/data/catalogue/categories";
import { products } from "@/data/catalogue/products";
import { getProductBySlug } from "@/data/catalogue/selectors";
import { getIndustryBySlug } from "@/data/industries";
import { createMetadata } from "@/lib/seo/metadata";
import { rfqSources, type RfqSource } from "@/types/enquiry";

export const metadata: Metadata = createMetadata({
  absoluteTitle: "Request a Quote | Haribol Lubes Limited Kenya",
  description: "Request a quotation from Haribol Lubes Limited for automotive and industrial lubricants, Mastermax products and commercial lubricant requirements in Kenya.",
  path: "/request-a-quote",
  indexable: false,
});

type PageProps = { searchParams: Promise<{ product?: string | string[]; source?: string | string[]; industry?: string | string[] }> };

export default async function RequestAQuotePage({ searchParams }: PageProps) {
  const query = await searchParams;
  const productParam = typeof query.product === "string" ? query.product : "";
  const sourceParam = typeof query.source === "string" ? query.source : "";
  const industryParam = typeof query.industry === "string" ? query.industry : "";
  const selectedProduct = getProductBySlug(productParam);
  const source: RfqSource = rfqSources.includes(sourceParam as RfqSource) ? sourceParam as RfqSource : selectedProduct ? "product-page" : industryParam ? "industry-page" : "direct";
  const selectedIndustry = getIndustryBySlug(industryParam);
  const mainCategories = catalogueCategories.filter((category) => !category.parentCategoryId && category.id !== "specialty-fluids");

  return <RfqPage categories={mainCategories.map(({ id, name }) => ({ id, name }))} industry={selectedIndustry ? { name: selectedIndustry.name, slug: selectedIndustry.slug } : null} initialProductSlug={selectedProduct?.slug ?? ""} products={products.map((product) => ({ id: product.id, slug: product.slug, name: product.name, brand: "Mastermax", categoryId: product.primaryCategoryId, href: `/products/${product.primaryCategoryId}/${product.slug}` }))} source={source} />;
}
