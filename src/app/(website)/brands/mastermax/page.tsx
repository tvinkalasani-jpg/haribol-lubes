import type { Metadata } from "next";

import { PageContainer } from "@/components/ui/page-container";
import { mastermaxBrand } from "@/data/brands";
import {
  getAllProductPageData,
  getProductPath,
} from "@/features/catalogue/product-page-data";
import { createMetadata } from "@/lib/seo/metadata";

import styles from "./page.module.css";

export const metadata: Metadata = createMetadata({
  title: "Mastermax Lubricants",
  description:
    "Mastermax is the current featured lubricant brand of Haribol Lubes Limited, with engine, hydraulic, transmission, compressor, industrial and grease product groups.",
  path: "/brands/mastermax",
});

export default function MastermaxPage() {
  const currentProducts = getAllProductPageData().filter(
    ({ product }) => product.brandId === mastermaxBrand.id,
  );

  return (
    <PageContainer className={styles.page} size="wide">
      <p className={styles.eyebrow}>Featured lubricant brand</p>
      <p className={styles.company}>Haribol Lubes Limited</p>
      <h1>{mastermaxBrand.name}</h1>
      <p className={styles.intro}>
        Mastermax is Haribol Lubes Limited&apos;s current featured lubricant brand. Explore the
        product families and named products represented in the structured Kenya catalogue.
      </p>

      <section aria-labelledby="mastermax-groups-title" className={styles.groups}>
        <div>
          <p>Current catalogue structure</p>
          <h2 id="mastermax-groups-title">Products and ranges</h2>
        </div>
        <ul>
          {currentProducts.map(({ product, category }, index) => (
            <li key={product.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <a href={getProductPath(product)}>
                <h3>{product.name}</h3>
                <p>{category.name} · {product.shortDescription}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className={styles.notice}>Technical details remain subject to final product verification.</p>
    </PageContainer>
  );
}
