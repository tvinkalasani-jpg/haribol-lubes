import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { industries } from "@/data/industries";
import { canonicalCategoryIds } from "@/features/catalogue/category-page-data";
import { getPublicInsights } from "@/features/content/content-repository";
import { isProductionIndexingEnabled } from "@/lib/seo/environment";

export const revalidate = 3600;

const staticPaths = [
  "/", "/products", ...canonicalCategoryIds.map((slug) => `/products/${slug}`),
  "/industries", ...industries.map((industry) => industry.futureHref),
  "/about", "/contact", "/product-finder", "/insights", "/resources", "/brands/mastermax",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProductionIndexingEnabled()) return [];
  const insights = await getPublicInsights();
  return [
    ...staticPaths.map((path) => ({ url: new URL(path, siteConfig.domain).toString() })),
    ...insights.filter((insight) => insight.seo.indexable).map((insight) => ({
      url: new URL(`/insights/${insight.slug}`, siteConfig.domain).toString(),
      lastModified: insight.updatedAt ? new Date(insight.updatedAt) : undefined,
    })),
  ];
}
