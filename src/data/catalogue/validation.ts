import { brands } from "@/data/brands";
import { industries } from "@/data/industries";

import { applications } from "./applications";
import { catalogueCategories } from "./categories";
import { markets } from "./markets";
import { products } from "./products";
import { specifications } from "./specifications";

function findDuplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return [...duplicates];
}

function reportDuplicates(
  issues: string[],
  label: string,
  values: readonly string[],
): void {
  for (const value of findDuplicates(values)) {
    issues.push(`Duplicate ${label}: ${value}`);
  }
}

export function validateCatalogue(): readonly string[] {
  const issues: string[] = [];
  const brandIds = new Set<string>(brands.map((brand) => brand.id));
  const categoryIds = new Set<string>(catalogueCategories.map((category) => category.id));
  const applicationIds = new Set<string>(applications.map((application) => application.id));
  const industryIds = new Set<string>(industries.map((industry) => industry.id));
  const marketIds = new Set<string>(markets.map((market) => market.id));
  const specificationIds = new Set<string>(specifications.map((specification) => specification.id));
  const productIds = new Set<string>(products.map((product) => product.id));

  reportDuplicates(issues, "product ID", products.map((product) => product.id));
  reportDuplicates(issues, "product slug", products.map((product) => product.slug));
  reportDuplicates(issues, "category ID", catalogueCategories.map((category) => category.id));
  reportDuplicates(issues, "category slug", catalogueCategories.map((category) => category.slug));
  reportDuplicates(issues, "application ID", applications.map((application) => application.id));
  reportDuplicates(issues, "application slug", applications.map((application) => application.slug));
  reportDuplicates(issues, "specification ID", specifications.map((specification) => specification.id));
  reportDuplicates(issues, "market ID", markets.map((market) => market.id));
  reportDuplicates(issues, "market code", markets.map((market) => market.code));
  reportDuplicates(
    issues,
    "variant ID",
    products.flatMap((product) => product.variants.map((variant) => variant.id)),
  );
  reportDuplicates(
    issues,
    "image ID",
    products.flatMap((product) => product.images.map((image) => image.id)),
  );
  reportDuplicates(
    issues,
    "document ID",
    products.flatMap((product) => product.documents.map((document) => document.id)),
  );

  for (const category of catalogueCategories) {
    if (category.parentCategoryId && !categoryIds.has(category.parentCategoryId)) {
      issues.push(`Category ${category.id} references missing parent ${category.parentCategoryId}.`);
    }
  }

  for (const product of products) {
    if (!brandIds.has(product.brandId)) {
      issues.push(`Product ${product.id} references missing brand ${product.brandId}.`);
    }
    if (product.brandId.toLocaleLowerCase("en") === "simba") {
      issues.push(`Product ${product.id} must not reference the unconfirmed Simba brand.`);
    }
    if (!categoryIds.has(product.primaryCategoryId)) {
      issues.push(`Product ${product.id} references missing category ${product.primaryCategoryId}.`);
    }
    for (const categoryId of product.secondaryCategoryIds ?? []) {
      if (!categoryIds.has(categoryId)) {
        issues.push(`Product ${product.id} references missing secondary category ${categoryId}.`);
      }
    }
    for (const applicationId of product.applicationIds) {
      if (!applicationIds.has(applicationId)) {
        issues.push(`Product ${product.id} references missing application ${applicationId}.`);
      }
    }
    for (const industryId of product.industryIds) {
      if (!industryIds.has(industryId)) {
        issues.push(`Product ${product.id} references missing industry ${industryId}.`);
      }
    }
    for (const specificationId of product.specificationIds) {
      if (!specificationIds.has(specificationId)) {
        issues.push(`Product ${product.id} references missing specification ${specificationId}.`);
      }
    }
    for (const market of product.markets) {
      if (!marketIds.has(market.marketId)) {
        issues.push(`Product ${product.id} references missing market ${market.marketId}.`);
      }
    }
    for (const relationship of product.relationships) {
      if (!productIds.has(relationship.productId)) {
        issues.push(`Product ${product.id} references missing related product ${relationship.productId}.`);
      }
    }
    for (const variant of product.variants) {
      if (variant.productId !== product.id) {
        issues.push(`Variant ${variant.id} references ${variant.productId} instead of ${product.id}.`);
      }
      for (const marketId of variant.marketIds) {
        if (!marketIds.has(marketId)) {
          issues.push(`Variant ${variant.id} references missing market ${marketId}.`);
        }
      }
      for (const specificationId of variant.specificationIds ?? []) {
        if (!specificationIds.has(specificationId)) {
          issues.push(`Variant ${variant.id} references missing specification ${specificationId}.`);
        }
      }
    }
  }

  return issues;
}

export function assertCatalogueIntegrity(): void {
  const issues = validateCatalogue();

  if (issues.length > 0) {
    throw new Error(`Catalogue validation failed:\n${issues.join("\n")}`);
  }
}
