import Image from "next/image";
import type { ReactNode } from "react";

import buttonStyles from "@/components/ui/button.module.css";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { getProductPath, type ProductPageData } from "@/features/catalogue/product-page-data";
import { createCanonicalUrl } from "@/lib/seo/canonical";
import type { SpecificationKind } from "@/types/product";

import { Breadcrumbs } from "./breadcrumbs";
import styles from "./product-detail-page.module.css";

type ProductDetailPageProps = {
  data: ProductPageData;
  storefront?: ReactNode;
};

const specificationLabels: Record<SpecificationKind, string> = {
  "performance-standard": "Performance standard",
  "transmission-classification": "Technical classification",
  "oem-approval": "Approval",
  "technical-classification": "Technical classification",
};

export function ProductDetailPage({ data, storefront }: ProductDetailPageProps) {
  const { product } = data;
  const whatsappContext = { type: "product" as const, productName: product.name, pageUrl: createCanonicalUrl(data.canonicalPath) };
  const specificationById = new Map(
    data.specifications.map((specification) => [specification.id, specification]),
  );
  const hasTechnicalInformation = Boolean(
    product.lubricantType ||
      product.baseOilType ||
      data.specifications.length ||
      product.technicalProperties.length,
  );
  const hasPackaging = product.variants.some((variant) => variant.packSize);
  const supplyHeading = product.documents.length ? "Packaging and documents" : "Packaging";

  return (
    <article className={styles.page}>
      <PageContainer className={styles.breadcrumbContainer} size="wide">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: data.category.name, href: `/products/${data.category.slug}` },
            { label: product.name },
          ]}
        />
      </PageContainer>

      <header className={styles.hero}>
        <PageContainer className={styles.heroGrid} size="wide">
          <div className={styles.heroCopy}>
            <a className={styles.brand} href={data.brand.futureHref}>
              {data.brand.name}
            </a>
            <p className={styles.categoryLabel}>{data.category.name}</p>
            <h1>{product.name}</h1>
            <p className={styles.summary}>
              {product.description ?? product.shortDescription}
            </p>
            <div className={styles.heroActions}>
              <a
                className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.large}`}
                href={data.quotePath}
              >
                Request a Quote
                <ArrowRightIcon />
              </a>
              <WhatsAppLink
                className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
                context={whatsappContext}
                source="product-page"
              >
                Ask on WhatsApp
              </WhatsAppLink>
              <a
                className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
                href={`/products/${data.category.slug}`}
              >
                View {data.category.name}
              </a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <span className={styles.visualCode} aria-hidden="true">
              HL / PRODUCT
            </span>
            <div className={styles.visualGrid} aria-hidden="true" />
            {data.image ? (
              <Image
                alt={data.image.alt}
                className={styles.productImage}
                height={760}
                priority
                sizes="(max-width: 768px) 84vw, (max-width: 1200px) 42vw, 34vw"
                src={data.image.src}
                width={640}
              />
            ) : null}
            <p>{product.productFamily ?? data.category.name} · Kenya catalogue</p>
          </div>
        </PageContainer>
      </header>

      {storefront}

      <PageContainer className={styles.content} size="wide">
        {product.variants.length ? (
          <section className={styles.variants} aria-labelledby="product-variants-title">
            <header className={styles.sectionHeading}>
              <p>01 / Catalogue options</p>
              <div>
                <h2 id="product-variants-title">Known formulations</h2>
                <p>
                  The following grades and classifications are currently recorded for this
                  product family.
                </p>
              </div>
            </header>

            <ol className={styles.variantGrid}>
              {product.variants.map((variant, index) => {
                const variantSpecifications = (variant.specificationIds ?? []).flatMap(
                  (specificationId) => {
                    const specification = specificationById.get(specificationId);
                    return specification ? [specification] : [];
                  },
                );

                return (
                  <li key={variant.id}>
                    <span className={styles.variantNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{variant.name}</h3>
                    <dl>
                      {variant.viscosityGrade ? (
                        <div>
                          <dt>Viscosity / grade</dt>
                          <dd>{variant.viscosityGrade.value}</dd>
                        </div>
                      ) : null}
                      {variantSpecifications.map((specification) => (
                        <div key={specification.id}>
                          <dt>{specificationLabels[specification.kind]}</dt>
                          <dd>{specification.code}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : (
          <section className={styles.namedProduct} aria-labelledby="named-product-title">
            <p>01 / Catalogue product</p>
            <div>
              <h2 id="named-product-title">Distinct product record</h2>
              <p>
                This is listed as an individual Mastermax product. No separate grades or
                formulations are currently recorded.
              </p>
            </div>
          </section>
        )}

        <section className={styles.useCases} aria-labelledby="product-use-title">
          <header className={styles.sectionHeading}>
            <p>02 / Use context</p>
            <div>
              <h2 id="product-use-title">Applications and industries</h2>
              <p>Use context derived from the current structured catalogue relationships.</p>
            </div>
          </header>

          <div className={styles.useCaseGrid}>
            <div>
              <span className={styles.panelLabel}>Applications</span>
              <ul>
                {data.applications.map((application) => (
                  <li key={application.id}>
                    <a href="/applications">
                      <h3>{application.name}</h3>
                      <p>{application.description}</p>
                      <ArrowRightIcon />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className={styles.panelLabel}>Relevant industries</span>
              <ul>
                {data.industries.map((industry) => (
                  <li key={industry.id}>
                    <a href={industry.futureHref}>
                      <span>{industry.displayIndex}</span>
                      <h3>{industry.name}</h3>
                      <ArrowRightIcon />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {hasTechnicalInformation ? (
          <section className={styles.technical} aria-labelledby="product-technical-title">
            <header className={styles.sectionHeading}>
              <p>03 / Technical record</p>
              <div>
                <h2 id="product-technical-title">Technical information</h2>
                <p>Only currently documented catalogue fields are shown.</p>
              </div>
            </header>

            <dl className={styles.technicalGrid}>
              {product.lubricantType ? (
                <div>
                  <dt>Lubricant type</dt>
                  <dd>{product.lubricantType.value}</dd>
                </div>
              ) : null}
              {product.baseOilType ? (
                <div>
                  <dt>Base oil type</dt>
                  <dd>{product.baseOilType.value}</dd>
                </div>
              ) : null}
              {data.specifications.map((specification) => (
                <div key={specification.id}>
                  <dt>{specificationLabels[specification.kind]}</dt>
                  <dd>{specification.name}</dd>
                </div>
              ))}
              {product.technicalProperties.map((property) => (
                <div key={property.id}>
                  <dt>{property.propertyName}</dt>
                  <dd>
                    {property.value}
                    {property.unit ? ` ${property.unit}` : ""}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section className={styles.supply} aria-labelledby="product-supply-title">
          <div>
            <p>04 / Supply information</p>
            <h2 id="product-supply-title">{supplyHeading}</h2>
          </div>
          <div className={styles.supplyDetails}>
            {hasPackaging ? (
              <dl>
                {product.variants.flatMap((variant) =>
                  variant.packSize ? (
                    <div key={variant.id}>
                      <dt>{variant.name}</dt>
                      <dd>
                        {variant.packSize.value} {variant.packUnit}
                      </dd>
                    </div>
                  ) : (
                    []
                  ),
                )}
              </dl>
            ) : (
              <p>Packaging options will be confirmed on enquiry.</p>
            )}
            {product.documents.length ? (
              <ul>
                {product.documents.map((document) => (
                  <li key={document.id}>
                    <a href={document.fileUrl}>{document.title}</a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <aside className={styles.verificationNotice} aria-labelledby="product-notice-title">
          <span aria-hidden="true">i</span>
          <div>
            <h2 id="product-notice-title">Technical information notice</h2>
            <p>
              Technical classifications and product details shown are based on current catalogue
              information and remain subject to final product verification. Confirm suitability
              and availability with Haribol Lubes Limited before selection.
            </p>
          </div>
        </aside>

        <section className={styles.enquiry} aria-labelledby="product-enquiry-title">
          <div>
            <p>05 / Product enquiry</p>
            <h2 id="product-enquiry-title">Discuss this product with Haribol</h2>
            <span>Share the application, preferred grade and expected volume.</span>
          </div>
          <div className={styles.enquiryActions}>
            <a
              className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.large}`}
              href={data.quotePath}
            >
              Request a Quote
              <ArrowRightIcon />
            </a>
            <WhatsAppLink
              className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`}
              context={whatsappContext}
              source="product-page"
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

        {data.relatedProducts.length ? (
          <section className={styles.related} aria-labelledby="related-products-title">
            <header>
              <p>Continue exploring</p>
              <h2 id="related-products-title">Related products</h2>
            </header>
            <ul>
              {data.relatedProducts.map((relatedProduct, index) => (
                <li key={relatedProduct.id}>
                  <a href={getProductPath(relatedProduct)}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{relatedProduct.name}</h3>
                      <p>{relatedProduct.shortDescription}</p>
                    </div>
                    <ArrowRightIcon />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </PageContainer>
    </article>
  );
}
