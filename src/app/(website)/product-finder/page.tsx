import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { ProductFinder } from "@/components/catalogue/product-finder";
import { PageContainer } from "@/components/ui/page-container";
import {
  createProductFinderDataset,
  hasProductFinderParams,
  parseProductFinderParams,
} from "@/features/catalogue/product-finder";
import { createMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbSchema, createPageSchema, createSchemaGraph, JsonLd } from "@/lib/seo/structured-data";

import styles from "./page.module.css";

type ProductFinderPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: ProductFinderPageProps): Promise<Metadata> {
  const state = parseProductFinderParams(await searchParams);

  return {
    ...createMetadata({
      absoluteTitle: "Product Finder | Haribol Lubes Limited",
      description:
        "Narrow the current Haribol lubricant catalogue by application, product category and known technical detail.",
      path: "/product-finder",
      indexable: !hasProductFinderParams(state),
    }),
  };
}

export default async function ProductFinderPage({ searchParams }: ProductFinderPageProps) {
  const dataset = createProductFinderDataset({ includeUnpublished: true });
  const initialState = parseProductFinderParams(await searchParams);

  return (
    <article className={styles.page}>
      <JsonLd data={createSchemaGraph([
        createPageSchema({ path: "/product-finder", name: "Product Finder", description: "Guided lubricant catalogue selection by application and technical detail." }),
        createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Product Finder", path: "/product-finder" }]),
      ])} />
      <PageContainer className={styles.container} size="wide">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Product Finder" }]}
        />
        <header className={styles.heading}>
          <p>Haribol Lubes Limited / Guided catalogue selection</p>
          <h1>Product Finder</h1>
          <div>
            <span>
              Narrow the current automotive and industrial range using structured catalogue information.
            </span>
            <small>No vehicle, machine or OEM compatibility is confirmed by this tool.</small>
          </div>
        </header>

        <ProductFinder dataset={dataset} initialState={initialState} />
      </PageContainer>
    </article>
  );
}
