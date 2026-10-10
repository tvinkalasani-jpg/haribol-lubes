import { brands } from "@/data/brands";
import type { Product, ProductSearchDocument } from "@/types/product";

import { catalogueCategories } from "./categories";
import { products } from "./products";
import { specifications } from "./specifications";

export function getProductById(productId: string): Product | undefined {
  return products.find((product) => product.id === productId);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByBrand(brandId: string): readonly Product[] {
  return products.filter((product) => product.brandId === brandId);
}

export function getProductsByCategory(categoryId: string): readonly Product[] {
  return products.filter(
    (product) =>
      product.primaryCategoryId === categoryId ||
      product.secondaryCategoryIds?.includes(categoryId),
  );
}

export function getProductsByApplication(applicationId: string): readonly Product[] {
  return products.filter((product) => product.applicationIds.includes(applicationId));
}

export function getProductsByIndustry(industryId: string): readonly Product[] {
  return products.filter((product) => product.industryIds.includes(industryId));
}

export function getProductsByMarket(marketId: string): readonly Product[] {
  return products.filter((product) =>
    product.markets.some((market) => market.marketId === marketId),
  );
}

export function getProductsBySpecification(specificationId: string): readonly Product[] {
  return products.filter(
    (product) =>
      product.specificationIds.includes(specificationId) ||
      product.variants.some((variant) => variant.specificationIds?.includes(specificationId)),
  );
}

export function createProductSearchDocument(product: Product): ProductSearchDocument {
  const brand = brands.find((entry) => entry.id === product.brandId);
  const categoryIds = [product.primaryCategoryId, ...(product.secondaryCategoryIds ?? [])];
  const categoryNames = catalogueCategories
    .filter((category) => categoryIds.includes(category.id))
    .map((category) => category.name);
  const productSpecificationIds = new Set([
    ...product.specificationIds,
    ...product.variants.flatMap((variant) => variant.specificationIds ?? []),
  ]);
  const specificationCodes = specifications
    .filter((specification) => productSpecificationIds.has(specification.id))
    .map((specification) => specification.code);
  const viscosityGrades = product.variants.flatMap((variant) =>
    variant.viscosityGrade ? [variant.viscosityGrade.value] : [],
  );
  const productCodes = product.variants.flatMap((variant) =>
    variant.productCode ? [variant.productCode] : [],
  );
  const marketIds = product.markets.map((market) => market.marketId);
  const searchableParts = [
    product.name,
    brand?.name,
    ...categoryNames,
    ...viscosityGrades,
    ...specificationCodes,
    ...product.searchKeywords,
    ...productCodes,
  ].filter((value): value is string => Boolean(value));

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brandId: product.brandId,
    categoryIds,
    applicationIds: product.applicationIds,
    industryIds: product.industryIds,
    marketIds,
    viscosityGrades,
    specificationIds: [...productSpecificationIds],
    productCodes,
    keywords: product.searchKeywords,
    searchableText: searchableParts.join(" ").toLocaleLowerCase("en"),
  };
}

export const productSearchDocuments = products.map(createProductSearchDocument);
