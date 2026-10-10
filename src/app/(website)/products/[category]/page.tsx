import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ProductCategoryPage as ProductCategoryLanding } from "@/components/catalogue/product-category-page";
import {
  categoryRouteSlugs,
  getCategoryPageData,
  legacyCategoryRedirects,
} from "@/features/catalogue/category-page-data";
import { createMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbSchema, createPageSchema, createSchemaGraph, JsonLd } from "@/lib/seo/structured-data";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return categoryRouteSlugs.map((category) => ({ category }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const data = getCategoryPageData(slug);

  if (!data) {
    return {};
  }

  return {
    ...createMetadata({
      absoluteTitle: `${data.category.name} Kenya | Haribol Lubes Limited`,
      description:
        data.productRanges.length > 0
          ? `Explore ${data.category.name.toLocaleLowerCase("en")} represented in Haribol Lubes Limited's Kenya catalogue, including known formulations, applications and enquiry options.`
          : `Contact Haribol Lubes Limited in Kenya to discuss current ${data.category.name.toLocaleLowerCase("en")} requirements and catalogue availability.`,
      path: `/products/${data.category.slug}`,
      indexable: data.indexable,
    }),
  };
}

export default async function ProductCategoryRoutePage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const redirectTarget = legacyCategoryRedirects[
    slug as keyof typeof legacyCategoryRedirects
  ];

  if (redirectTarget) {
    permanentRedirect(redirectTarget);
  }

  const data = getCategoryPageData(slug);

  if (!data) {
    notFound();
  }

  return <><JsonLd data={data.indexable ? createSchemaGraph([
    createPageSchema({ type: "CollectionPage", path: `/products/${data.category.slug}`, name: data.category.name, description: `Haribol Lubes catalogue for ${data.category.name.toLocaleLowerCase("en")}.` }),
    createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, { name: data.category.name, path: `/products/${data.category.slug}` }]),
  ]) : undefined} /><ProductCategoryLanding data={data} /></>;
}
