import { applications } from "@/data/catalogue/applications";
import { catalogueCategories } from "@/data/catalogue/categories";
import { getProductsByCategory } from "@/data/catalogue/selectors";
import { brands } from "@/data/brands";
import { industries } from "@/data/industries";
import type { Application, Product, ProductCategory, ProductImage } from "@/types/product";
import type { Brand } from "@/data/brands";
import type { Industry } from "@/data/industries";

export const canonicalCategoryIds = [
  "engine-oils",
  "hydraulic-oils",
  "transmission-gear-oils",
  "compressor-oils",
  "industrial-lubricants",
  "greases",
] as const;

export const retainedCategoryIds = ["specialty-fluids"] as const;

const renderedCategoryIds = new Set<string>([
  ...canonicalCategoryIds,
  ...retainedCategoryIds,
]);

export const legacyCategoryRedirects = {
  "gear-oils": "/products/transmission-gear-oils",
  "transmission-fluids": "/products/transmission-gear-oils",
} as const;

export const categoryRouteSlugs = [
  ...canonicalCategoryIds,
  ...retainedCategoryIds,
  ...Object.keys(legacyCategoryRedirects),
] as const;

export type CategoryRouteSlug = (typeof categoryRouteSlugs)[number];

export type CategoryProductRange = {
  product: Product;
  brand: Brand;
};

export type CategoryPageData = {
  category: ProductCategory;
  productRanges: readonly CategoryProductRange[];
  applications: readonly Application[];
  industries: readonly Industry[];
  brands: readonly Brand[];
  heroImage?: ProductImage;
  relatedCategories: readonly ProductCategory[];
  indexable: boolean;
};

function uniqueValues(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function getCategoryById(categoryId: string): ProductCategory | undefined {
  return catalogueCategories.find((category) => category.id === categoryId);
}

function getCategoryProducts(categoryId: string): readonly Product[] {
  return getProductsByCategory(categoryId);
}

function categoryRelationshipScore(sourceProducts: readonly Product[], categoryId: string): number {
  const candidateProducts = getCategoryProducts(categoryId);
  const sourceApplications = new Set(sourceProducts.flatMap((product) => product.applicationIds));
  const sourceIndustries = new Set(sourceProducts.flatMap((product) => product.industryIds));
  const candidateApplications = uniqueValues(
    candidateProducts.flatMap((product) => product.applicationIds),
  );
  const candidateIndustries = uniqueValues(
    candidateProducts.flatMap((product) => product.industryIds),
  );

  return (
    candidateApplications.filter((applicationId) => sourceApplications.has(applicationId)).length * 2 +
    candidateIndustries.filter((industryId) => sourceIndustries.has(industryId)).length
  );
}

export function isCategoryRouteSlug(slug: string): slug is CategoryRouteSlug {
  return categoryRouteSlugs.some((categorySlug) => categorySlug === slug);
}

export function getCategoryPageData(slug: string): CategoryPageData | undefined {
  const category = catalogueCategories.find((entry) => entry.slug === slug);

  if (!category || !renderedCategoryIds.has(category.id)) {
    return undefined;
  }

  const categoryProducts = getCategoryProducts(category.id);
  const productBrandIds = uniqueValues(categoryProducts.map((product) => product.brandId));
  const applicationIds = uniqueValues(
    categoryProducts.flatMap((product) => product.applicationIds),
  );
  const industryIds = uniqueValues(categoryProducts.flatMap((product) => product.industryIds));
  const relatedCategories = canonicalCategoryIds
    .filter((categoryId) => categoryId !== category.id)
    .map((categoryId) => ({
      category: getCategoryById(categoryId),
      score: categoryRelationshipScore(categoryProducts, categoryId),
    }))
    .filter(
      (entry): entry is { category: ProductCategory; score: number } => Boolean(entry.category),
    )
    .sort((a, b) => b.score - a.score || a.category.displayOrder - b.category.displayOrder)
    .slice(0, 3)
    .map((entry) => entry.category);

  return {
    category,
    productRanges: categoryProducts.flatMap((product) => {
      const brand = brands.find((entry) => entry.id === product.brandId);
      return brand ? [{ product, brand }] : [];
    }),
    applications: applications.filter((application) => applicationIds.includes(application.id)),
    industries: industries.filter((industry) => industryIds.includes(industry.id)),
    brands: brands.filter((brand) => productBrandIds.includes(brand.id)),
    heroImage: categoryProducts[0]?.images[0],
    relatedCategories,
    indexable: canonicalCategoryIds.some((categoryId) => categoryId === category.id),
  };
}

export function getCanonicalCategoryPages(): readonly CategoryPageData[] {
  return canonicalCategoryIds.flatMap((categoryId) => {
    const category = getCategoryById(categoryId);
    const pageData = category ? getCategoryPageData(category.slug) : undefined;
    return pageData ? [pageData] : [];
  });
}
