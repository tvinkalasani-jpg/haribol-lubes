import buttonStyles from "@/components/ui/button.module.css";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import {
  productCategories,
  type ProductCategoryVisual,
} from "@/data/product-categories";

import styles from "./product-categories.module.css";

function CategoryArtwork({ visual }: { visual: ProductCategoryVisual }) {
  if (visual === "engine") {
    return (
      <svg viewBox="0 0 360 240" role="presentation">
        <circle cx="210" cy="118" r="82" />
        <circle cx="210" cy="118" r="48" />
        <path d="M210 20v24M210 192v24M112 118h24M284 118h24" />
        <path className={styles.accentStroke} d="M143 78a78 78 0 0 1 128-8" />
        <path d="M78 198h118M78 190v16M196 190v16" />
      </svg>
    );
  }

  if (visual === "gear") {
    return (
      <svg viewBox="0 0 360 240" role="presentation">
        <circle cx="144" cy="120" r="66" />
        <circle cx="144" cy="120" r="30" />
        <circle cx="245" cy="105" r="48" />
        <circle cx="245" cy="105" r="19" />
        <path className={styles.accentStroke} d="M87 87a66 66 0 0 1 103-20M218 64a48 48 0 0 1 70 30" />
        <path d="m144 43 8 14m-79 63h17m54 63v15m67-78h17m17-70v15m0 80v15" />
      </svg>
    );
  }

  if (visual === "transmission") {
    return (
      <svg viewBox="0 0 360 240" role="presentation">
        <path d="M50 64h92l48 55h120M50 176h92l48-57" />
        <path className={styles.accentStroke} d="M50 120h260" />
        <circle cx="50" cy="64" r="7" />
        <circle cx="50" cy="120" r="7" />
        <circle cx="50" cy="176" r="7" />
        <circle cx="310" cy="119" r="11" />
      </svg>
    );
  }

  if (visual === "hydraulic") {
    return (
      <svg viewBox="0 0 360 240" role="presentation">
        <rect x="58" y="87" width="142" height="66" />
        <path d="M200 105h95v30h-95M96 87V55M96 153v32" />
        <path className={styles.accentStroke} d="M80 120h193" />
        <circle cx="80" cy="120" r="10" />
        <path d="M295 77v86M286 77h18M286 163h18" />
      </svg>
    );
  }

  if (visual === "industrial") {
    return (
      <svg viewBox="0 0 360 240" role="presentation">
        <path d="M52 58h256M52 120h256M52 182h256M90 34v172M180 34v172M270 34v172" />
        <circle cx="180" cy="120" r="61" />
        <circle cx="180" cy="120" r="27" />
        <path className={styles.accentStroke} d="M122 101a61 61 0 0 1 101-27" />
      </svg>
    );
  }

  if (visual === "grease") {
    return (
      <svg viewBox="0 0 360 240" role="presentation">
        <path d="M60 75c50-42 105-42 154 0s92 42 126 0M24 120c50-42 105-42 154 0s92 42 158 0M60 165c50-42 105-42 154 0s92 42 126 0" />
        <path className={styles.accentStroke} d="M24 120c50-42 105-42 154 0" />
        <circle cx="178" cy="120" r="9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 360 240" role="presentation">
      <path d="M34 120h48l25-52 45 104 45-104 32 72 24-40 22 20h51" />
      <path className={styles.accentStroke} d="M34 120h48l25-52 45 104" />
      <circle cx="152" cy="172" r="8" />
      <path d="M60 42h240M60 198h240M60 34v16M300 34v16M60 190v16M300 190v16" />
    </svg>
  );
}

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
            <li key={category.href} className={styles[category.visual]}>
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
                  <span className={styles.cardArrow} aria-hidden="true">
                    <ArrowRightIcon />
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
