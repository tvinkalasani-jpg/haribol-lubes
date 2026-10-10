import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CatalogueSearch } from "@/components/catalogue/catalogue-search";
import { PageContainer } from "@/components/ui/page-container";
import {
  createCatalogueSearchDataset,
  hasActiveCatalogueState,
  parseCatalogueSearchParams,
} from "@/features/catalogue/catalogue-search";
import { createMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbSchema, createPageSchema, createSchemaGraph, JsonLd } from "@/lib/seo/structured-data";

import styles from "./page.module.css";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const state = parseCatalogueSearchParams(await searchParams);

  return {
    ...createMetadata({
      absoluteTitle: "Lubricant Products | Haribol Lubes Limited",
      description:
        "Search automotive and industrial lubricant products, grades, applications and classifications represented in Haribol Lubes Limited's Kenya catalogue.",
      path: "/products",
      indexable: !hasActiveCatalogueState(state),
    }),
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const initialState = parseCatalogueSearchParams(await searchParams);
  const dataset = createCatalogueSearchDataset({ includeUnpublished: true });

  return (
    <article className={styles.page}>
      <JsonLd data={createSchemaGraph([
        createPageSchema({ type: "CollectionPage", path: "/products", name: "Lubricant Products", description: "Haribol Lubes automotive and industrial lubricant catalogue." }),
        createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Products", path: "/products" }]),
      ])} />
      <PageContainer className={styles.container} size="wide">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
        <header className={styles.heading}>
          <p>Haribol Lubes Limited / Product catalogue</p>
          <h1>Find a Product</h1>
          <span>
            Search the current automotive and industrial lubricant catalogue by product, grade,
            application or technical classification. Results support enquiry and comparison;
            they are not technical recommendations.
          </span>
          <dl>
            <div>
              <dt>Current records</dt>
              <dd>{dataset.records.length}</dd>
            </div>
            <div>
              <dt>Market</dt>
              <dd>Kenya</dd>
            </div>
            <div>
              <dt>Catalogue status</dt>
              <dd>Pre-launch review</dd>
            </div>
          </dl>
        </header>

        <aside className={styles.finderEntry} aria-label="Product Finder">
          <div>
            <span>Guided catalogue selection</span>
            <strong>Not sure where to begin?</strong>
            <p>Use application, product type and any known technical detail to narrow the current range.</p>
          </div>
          <Link href="/product-finder">Open Product Finder</Link>
        </aside>

        <CatalogueSearch dataset={dataset} initialState={initialState} />
      </PageContainer>
    </article>
  );
}
