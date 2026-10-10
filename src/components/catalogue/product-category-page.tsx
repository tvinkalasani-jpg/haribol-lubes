import Image from "next/image";

import buttonStyles from "@/components/ui/button.module.css";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import type { CategoryPageData } from "@/features/catalogue/category-page-data";
import { getProductPath } from "@/features/catalogue/product-page-data";

import { Breadcrumbs } from "./breadcrumbs";
import styles from "./product-category-page.module.css";

type ProductCategoryPageProps = {
  data: CategoryPageData;
};

export function ProductCategoryPage({ data }: ProductCategoryPageProps) {
  const knownEntryCount = data.productRanges.reduce(
    (count, range) => count + Math.max(range.product.variants.length, 1),
    0,
  );
  const brandNames = data.brands.map((brand) => brand.name).join(", ");
  const hasProducts = data.productRanges.length > 0;

  return (
    <article className={styles.page}>
      <PageContainer className={styles.breadcrumbContainer} size="wide">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: data.category.name },
          ]}
        />
      </PageContainer>

      <header className={styles.hero}>
        <PageContainer className={styles.heroGrid} size="wide">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              Product category
              {brandNames ? <span>Currently featuring {brandNames}</span> : null}
            </p>
            <h1>{data.category.name}</h1>
            <p className={styles.introduction}>
              {hasProducts
                ? `Explore the current ${data.category.name.toLocaleLowerCase("en")} represented within Haribol Lubes Limited's Kenya catalogue, with known formulations, applications and direct enquiry routes.`
                : `This category route is retained for future catalogue expansion. Contact Haribol Lubes Limited to discuss a current requirement.`}
            </p>

            <dl className={styles.heroFacts}>
              <div>
                <dt>Current ranges</dt>
                <dd>{data.productRanges.length}</dd>
              </div>
              <div>
                <dt>Known entries</dt>
                <dd>{hasProducts ? knownEntryCount : "Pending"}</dd>
              </div>
              <div>
                <dt>Market</dt>
                <dd>Kenya</dd>
              </div>
            </dl>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualGrid} aria-hidden="true" />
            <span className={styles.visualIndex} aria-hidden="true">
              HL / {String(data.category.displayOrder).padStart(2, "0")}
            </span>
            {data.heroImage ? (
              <Image
                alt={data.heroImage.alt}
                className={styles.heroImage}
                height={720}
                priority
                sizes="(max-width: 768px) 78vw, (max-width: 1200px) 42vw, 34vw"
                src={data.heroImage.src}
                width={600}
              />
            ) : (
              <div className={styles.pendingVisual} aria-hidden="true">
                <span>{data.category.name}</span>
              </div>
            )}
            <p>Structured catalogue view · Haribol Lubes Limited</p>
          </div>
        </PageContainer>
      </header>

      <PageContainer className={styles.content} size="wide">
        <section className={styles.ranges} aria-labelledby="category-ranges-title">
          <header className={styles.sectionHeading}>
            <p>01 / Current catalogue</p>
            <div>
              <h2 id="category-ranges-title">
                {hasProducts ? "Products and ranges" : "Catalogue entries pending"}
              </h2>
              <p>
                {hasProducts
                  ? "Current structured records are shown without extending the technical claims supplied by the catalogue."
                  : "No verified product record is currently assigned to this retained category route."}
              </p>
            </div>
          </header>

          {hasProducts ? (
            <div className={styles.rangeGrid}>
              {data.productRanges.map(({ product, brand }, rangeIndex) => (
                <article className={styles.rangeCard} id={product.slug} key={product.id}>
                  <div className={styles.rangeMeta}>
                    <span>{String(rangeIndex + 1).padStart(2, "0")}</span>
                    <a href={brand.futureHref}>{brand.name}</a>
                  </div>
                  <h3>
                    <a
                      aria-label={`View product details for ${product.name}`}
                      href={getProductPath(product)}
                    >
                      {product.name}
                      <ArrowRightIcon />
                    </a>
                  </h3>
                  <p className={styles.rangeDescription}>{product.shortDescription}</p>

                  {product.variants.length > 0 ? (
                    <div className={styles.knownEntries}>
                      <h4>Known catalogue entries</h4>
                      <ul>
                        {product.variants.map((variant) => (
                          <li key={variant.id}>
                            <span>{variant.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className={styles.singleEntry}>Distinct catalogue product</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span>Product records will appear after catalogue and business verification.</span>
              <a href="/contact">Discuss a lubricant requirement</a>
            </div>
          )}
        </section>

        {hasProducts ? (
          <section className={styles.useCases} aria-labelledby="category-applications-title">
            <header className={styles.sectionHeading}>
              <p>02 / Use context</p>
              <div>
                <h2 id="category-applications-title">Applications and industries</h2>
                <p>
                  Structured relationships help customers move from equipment or operating
                  context toward a relevant category enquiry.
                </p>
              </div>
            </header>

            <div className={styles.useCaseGrid}>
              <div className={styles.applicationPanel}>
                <span className={styles.panelLabel}>Applications</span>
                <ul>
                  {data.applications.map((application, index) => (
                    <li key={application.id}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{application.name}</h3>
                        <p>{application.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <a className={styles.panelLink} href="/applications">
                  Explore applications
                  <ArrowRightIcon />
                </a>
              </div>

              <div className={styles.industryPanel}>
                <span className={styles.panelLabel}>Relevant industries</span>
                <ul>
                  {data.industries.map((industry) => (
                    <li key={industry.id}>
                      <a href={industry.futureHref}>
                        <span>{industry.displayIndex}</span>
                        {industry.name}
                        <ArrowRightIcon />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        <aside className={styles.verificationNotice} aria-labelledby="technical-notice-title">
          <span aria-hidden="true">i</span>
          <div>
            <h2 id="technical-notice-title">Technical information notice</h2>
            <p>
              Product grades and technical classifications shown are based on current catalogue
              information and remain subject to final product verification. Confirm suitability
              and availability with Haribol Lubes Limited before selection.
            </p>
          </div>
        </aside>

        <section className={styles.enquiry} aria-labelledby="category-enquiry-title">
          <div>
            <p>03 / Direct enquiry</p>
            <h2 id="category-enquiry-title">Need help with this lubricant category?</h2>
            <span>
              Share the application, required grade and expected volume with the Haribol sales
              team.
            </span>
          </div>
          <div className={styles.enquiryActions}>
            <a
              className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.large}`}
              href="/request-a-quote"
            >
              Request a Quote
              <ArrowRightIcon />
            </a>
            <WhatsAppLink
              className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
              context={{ type: "category", categoryName: data.category.name }}
              source="category-page"
            >
              Ask on WhatsApp
            </WhatsAppLink>
            <a
              className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
              href="/contact"
            >
              Contact Haribol
            </a>
          </div>
        </section>

        <section className={styles.related} aria-labelledby="related-categories-title">
          <header>
            <p>Continue exploring</p>
            <h2 id="related-categories-title">Related categories</h2>
          </header>
          <ul>
            {data.relatedCategories.map((category, index) => (
              <li key={category.id}>
                <a href={`/products/${category.slug}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                  <ArrowRightIcon />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </PageContainer>
    </article>
  );
}
