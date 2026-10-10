import { mastermaxBrand, brands } from "@/data/brands";
import { applications } from "@/data/catalogue/applications";
import { catalogueCategories } from "@/data/catalogue/categories";
import { products } from "@/data/catalogue/products";
import { specifications } from "@/data/catalogue/specifications";
import { industries } from "@/data/industries";
import type { Brand } from "@/data/brands";
import type { Industry } from "@/data/industries";
import type {
  Application,
  Product,
  ProductCategory,
  ProductImage,
  Specification,
} from "@/types/product";

export type ProductPageData = {
  product: Product;
  brand: Brand;
  category: ProductCategory;
  applications: readonly Application[];
  industries: readonly Industry[];
  specifications: readonly Specification[];
  image?: ProductImage;
  relatedProducts: readonly Product[];
  canonicalPath: string;
  quotePath: string;
  indexable: boolean;
};

function uniqueValues(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

export function getProductPath(product: Product): string {
  const category = catalogueCategories.find(
    (entry) => entry.id === product.primaryCategoryId,
  );

  return category ? `/products/${category.slug}/${product.slug}` : `/products/${product.slug}`;
}

function relatedProductScore(source: Product, candidate: Product): number {
  const explicitRelationship = source.relationships.find(
    (relationship) => relationship.productId === candidate.id,
  );
  const sharedApplications = candidate.applicationIds.filter((applicationId) =>
    source.applicationIds.includes(applicationId),
  ).length;

  return (
    (explicitRelationship ? 100 : 0) +
    (source.primaryCategoryId === candidate.primaryCategoryId ? 20 : 0) +
    sharedApplications * 5 +
    (source.brandId === candidate.brandId ? 1 : 0)
  );
}

export function getProductPageData(
  categorySlug: string,
  productSlug: string,
): ProductPageData | undefined {
  const category = catalogueCategories.find((entry) => entry.slug === categorySlug);
  const product = products.find((entry) => entry.slug === productSlug);

  if (!category || !product || product.primaryCategoryId !== category.id) {
    return undefined;
  }

  const brand = brands.find((entry) => entry.id === product.brandId);

  if (!brand) {
    return undefined;
  }

  const specificationIds = uniqueValues([
    ...product.specificationIds,
    ...product.variants.flatMap((variant) => variant.specificationIds ?? []),
  ]);
  const productOrder = new Map(products.map((entry, index) => [entry.id, index]));
  const relatedProducts = products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({
      product: candidate,
      score: relatedProductScore(product, candidate),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (productOrder.get(a.product.id) ?? Number.MAX_SAFE_INTEGER) -
          (productOrder.get(b.product.id) ?? Number.MAX_SAFE_INTEGER),
    )
    .slice(0, 3)
    .map((entry) => entry.product);
  const canonicalPath = getProductPath(product);

  return {
    product,
    brand,
    category,
    applications: applications.filter((application) =>
      product.applicationIds.includes(application.id),
    ),
    industries: industries.filter((industry) => product.industryIds.includes(industry.id)),
    specifications: specifications.filter((specification) =>
      specificationIds.includes(specification.id),
    ),
    image: [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0],
    relatedProducts,
    canonicalPath,
    quotePath: `/request-a-quote?product=${encodeURIComponent(product.slug)}`,
    indexable: product.publicationStatus === "published" && product.seo.indexable,
  };
}

export function getProductStaticParams() {
  return products.map((product) => {
    const category = catalogueCategories.find(
      (entry) => entry.id === product.primaryCategoryId,
    );

    if (!category) {
      throw new Error(`Missing primary category for ${product.id}.`);
    }

    return { category: category.slug, product: product.slug };
  });
}

export function getAllProductPageData(): readonly ProductPageData[] {
  return getProductStaticParams().flatMap(({ category, product }) => {
    const data = getProductPageData(category, product);
    return data ? [data] : [];
  });
}

export { mastermaxBrand };
