import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontProductSlot } from "@storefront-product-slot";

import { ProductDetailPage } from "@/components/catalogue/product-detail-page";
import {
  getProductPageData,
  getProductStaticParams,
} from "@/features/catalogue/product-page-data";
import { createMetadata } from "@/lib/seo/metadata";

type ProductRoutePageProps = {
  params: Promise<{ category: string; product: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getProductStaticParams();
}

export async function generateMetadata({
  params,
}: ProductRoutePageProps): Promise<Metadata> {
  const { category, product } = await params;
  const data = getProductPageData(category, product);

  if (!data) {
    return {};
  }

  const description = `${data.product.shortDescription} Review known catalogue formulations, applications and enquiry options from Haribol Lubes Limited in Kenya.`;

  return {
    ...createMetadata({
      absoluteTitle: `${data.product.name} | Haribol Lubes Limited Kenya`,
      description,
      path: data.canonicalPath,
      indexable: data.indexable,
    }),
  };
}

export default async function ProductRoutePage({ params }: ProductRoutePageProps) {
  const { category, product } = await params;
  const data = getProductPageData(category, product);

  if (!data) {
    notFound();
  }

  return <ProductDetailPage
    data={data}
    storefront={<StorefrontProductSlot productSlug={product} quotePath={data.quotePath} />}
  />;
}
