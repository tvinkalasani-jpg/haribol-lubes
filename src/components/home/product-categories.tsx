import buttonStyles from "@/components/ui/button.module.css";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import {
  productCategories,
} from "@/data/product-categories";

import { CategoryArtwork } from "./category-artwork";
import styles from "./product-categories.module.css";

export function ProductCategories() {
  return (
    <section className={styles.section} aria-labelledby="product-range-title">
      <PageContainer className={styles.container} size="wide">
        <header className={styles.heading}>
          <p className={styles.eyebrow}>
            <span>03</span>
            Product range
          </p>
          <div className={styles.headingGrid}>
            <h2 id="product-range-title">
              Lubrication solutions for <span>every moving part.</span>
            </h2>
            <p>
              Explore Haribol Lubes&apos; automotive and industrial lubricant
              categories for vehicles, machinery and commercial applications
              in Kenya.
            </p>
          </div>
        </header>

        <ol className={styles.grid} aria-label="Product categories">
          {productCategories.map((category) => (
            <li
              key={`${category.href}-${category.name}`}
              className={styles[category.visual]}
              data-category={category.visual}
              data-visual-slot="category"
            >
              <a className={styles.card} href={category.href}>
                <span className={styles.cardMeta}>
                  <span>HL / {category.index}</span>
                  <span>Category</span>
                </span>
                <span className={styles.artwork} aria-hidden="true">
                  <CategoryArtwork visual={category.visual} />
                </span>
                <span className={styles.cardContent}>
                  <span>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </span>
                  <span className={styles.cardAction} aria-hidden="true">
                    <span>Explore category</span>
                    <span className={styles.cardArrow}>
                      <ArrowRightIcon />
                    </span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>

        <footer className={styles.footer}>
          <p>Seven core categories. One direct route to the right solution.</p>
          <div className={styles.footerActions}>
            {/* Native navigation keeps this section server-rendered without a client bundle. */}
            <a
              className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
              href="/product-finder"
            >
              Product Finder
              <ArrowRightIcon />
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
              href="/products"
            >
              Explore All Products
              <ArrowRightIcon />
            </a>
          </div>
        </footer>
      </PageContainer>
    </section>
  );
}
