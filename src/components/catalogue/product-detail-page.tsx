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

type ProductDetailPageProps = { data: ProductPageData; storefront?: ReactNode };

const specificationLabels: Record<SpecificationKind, string> = {
  "performance-standard": "Performance standard",
  "transmission-classification": "Technical classification",
  "oem-approval": "Approval",
  "technical-classification": "Technical classification",
};

function ProductTechnicalFallback({ category }: { category: string }) {
  return (
    <svg aria-hidden="true" className={styles.technicalFallback} focusable="false" role="presentation" viewBox="0 0 720 760">
      <g className={styles.fallbackGrid}>
        <path d="M72 88h576M72 672h576M96 64v632M624 64v632M72 380h576M360 64v632" />
        <circle cx="360" cy="380" r="224" /><circle cx="360" cy="380" r="154" />
      </g>
      <g className={styles.fallbackAssembly}>
        <circle cx="360" cy="380" r="126" /><circle cx="360" cy="380" r="66" /><circle cx="360" cy="380" r="18" />
        <path d="M360 254v-62M360 568v-62M234 380h-62M548 380h-62M271 291l-44-44M493 513l-44-44M449 291l44-44M227 513l44-44" />
      </g>
      <path className={styles.fallbackFluid} d="M104 526c92-190 184-220 280-96 70 90 139 68 232-82" />
      <text x="96" y="132">TECHNICAL PRODUCT VISUAL</text><text x="96" y="650">{category.toUpperCase()}</text>
    </svg>
  );
}

export function ProductDetailPage({ data, storefront }: ProductDetailPageProps) {
  const { product } = data;
  const whatsappContext = { type: "product" as const, productName: product.name, pageUrl: createCanonicalUrl(data.canonicalPath) };
  const specificationById = new Map(data.specifications.map((specification) => [specification.id, specification]));
  const technicalRows = [
    ...(product.lubricantType ? [{ label: "Lubricant type", value: product.lubricantType.value }] : []),
    ...(product.baseOilType ? [{ label: "Base oil type", value: product.baseOilType.value }] : []),
    ...data.specifications.map((specification) => ({ label: specificationLabels[specification.kind], value: specification.name })),
    ...product.technicalProperties.map((property) => ({ label: property.propertyName, value: `${property.value}${property.unit ? ` ${property.unit}` : ""}` })),
  ];
  const packagedVariants = product.variants.filter((variant) => variant.packSize);
  const showSupply = packagedVariants.length > 0 || product.documents.length > 0;

  return (
    <article className={styles.page} data-product-detail>
      <PageContainer className={styles.breadcrumbContainer} size="wide">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: data.category.name, href: `/products/${data.category.slug}` }, { label: product.name }]} />
      </PageContainer>

      <header className={styles.hero}>
        <PageContainer className={styles.heroGrid} size="wide">
          <figure className={styles.heroVisual}>
            <div className={styles.visualTopline}><span>HL / PRODUCT RECORD</span><span>{data.category.name}</span></div>
            <div className={styles.visualGrid} aria-hidden="true" /><div className={styles.visualOrbit} aria-hidden="true" />
            {data.image ? (
              <Image alt={data.image.alt} className={styles.productImage} height={760} priority sizes="(max-width: 768px) 88vw, (max-width: 1200px) 48vw, 42vw" src={data.image.src} width={640} />
            ) : <ProductTechnicalFallback category={data.category.name} />}
            <figcaption><span>{data.brand.name}</span><span>{product.productFamily ?? data.category.name}</span></figcaption>
          </figure>

          <div className={styles.heroCopy}>
            <div className={styles.identityMeta}>
              <a className={styles.brand} href={data.brand.futureHref}>{data.brand.name}</a><span aria-hidden="true">/</span><a href={`/products/${data.category.slug}`}>{data.category.name}</a>
            </div>
            <h1>{product.name}</h1>
            <p className={styles.summary}>{product.description ?? product.shortDescription}</p>
            <dl className={styles.identityFacts}>
              {product.lubricantType ? <div><dt>Product type</dt><dd>{product.lubricantType.value}</dd></div> : null}
              {product.variants.length ? <div><dt>Catalogue range</dt><dd>{product.variants.length} catalogue formulation{product.variants.length === 1 ? "" : "s"}</dd></div> : null}
              <div><dt>Current pathway</dt><dd>Technical enquiry</dd></div>
            </dl>
            {product.variants.length ? (
              <nav aria-label="Product formulations" className={styles.variantNavigator}>
                <span>Explore formulations</span>
                <ul>{product.variants.map((variant) => <li key={variant.id}><a href={`#variant-${variant.id}`}>{variant.viscosityGrade?.value ?? variant.name}</a></li>)}</ul>
              </nav>
            ) : null}
            <div className={styles.heroActions}>
              <a className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.large}`} href={data.quotePath}>Request a Quote<ArrowRightIcon /></a>
              <WhatsAppLink className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`} context={whatsappContext} source="product-page">Ask on WhatsApp</WhatsAppLink>
            </div>
            <div className={styles.discoveryLinks}><a href={`/products/${data.category.slug}`}>Return to {data.category.name}</a><a href="/product-finder">Open Product Finder</a></div>
          </div>
        </PageContainer>
      </header>

      {storefront}

      <PageContainer className={styles.content} size="wide">
        {technicalRows.length ? (
          <section className={styles.technical} aria-labelledby="product-technical-title">
            <header className={styles.sectionHeading}><p>01 / Technical record</p><div><h2 id="product-technical-title">Technical specification</h2><p>Current catalogue fields, presented without extending the supplied claims.</p></div></header>
            <div className={styles.tableFrame}>
              <table><caption className="sr-only">Technical specification for {product.name}</caption><thead><tr><th scope="col">Property</th><th scope="col">Recorded value</th></tr></thead><tbody>
                {technicalRows.map((row, index) => <tr key={`${row.label}-${row.value}-${index}`}><th scope="row">{row.label}</th><td>{row.value}</td></tr>)}
              </tbody></table>
            </div>
          </section>
        ) : null}

        <section className={styles.useCases} aria-labelledby="product-use-title">
          <header className={styles.sectionHeading}><p>02 / Use context</p><div><h2 id="product-use-title">Applications and industries</h2><p>Relationships recorded in the current catalogue, with no inferred compatibility.</p></div></header>
          <div className={styles.useCaseGrid}>
            <div><span className={styles.panelLabel}>Applications</span><ul>{data.applications.map((application) => <li key={application.id}><a href={`/product-finder?application=${application.slug}`}><div><h3>{application.name}</h3><p>{application.description}</p></div><ArrowRightIcon /></a></li>)}</ul></div>
            <div><span className={styles.panelLabel}>Relevant industries</span><ul>{data.industries.map((industry) => <li key={industry.id}><a href={industry.futureHref}><span>{industry.displayIndex}</span><div><h3>{industry.name}</h3><p>{industry.shortDescription}</p></div><ArrowRightIcon /></a></li>)}</ul></div>
          </div>
        </section>

        {product.variants.length ? (
          <section className={styles.variants} aria-labelledby="product-variants-title">
            <header className={styles.sectionHeading}><p>03 / Catalogue options</p><div><h2 id="product-variants-title">Available grades and formulations</h2><p>Only formulations and classifications present in the current catalogue are shown.</p></div></header>
            <ol className={styles.variantGrid}>
              {product.variants.map((variant, index) => {
                const variantSpecifications = (variant.specificationIds ?? []).flatMap((id) => { const specification = specificationById.get(id); return specification ? [specification] : []; });
                return <li id={`variant-${variant.id}`} key={variant.id}>
                  <div className={styles.variantHeader}><span>{String(index + 1).padStart(2, "0")}</span><span>Formulation</span></div>
                  <h3>{variant.name}</h3>
                  <dl>
                    {variant.viscosityGrade ? <div><dt>Viscosity / grade</dt><dd>{variant.viscosityGrade.value}</dd></div> : null}
                    {variantSpecifications.map((specification) => <div key={specification.id}><dt>{specificationLabels[specification.kind]}</dt><dd>{specification.code}</dd></div>)}
                    {variant.packSize ? <div><dt>Recorded pack</dt><dd>{variant.packSize.value} {variant.packUnit}</dd></div> : null}
                  </dl>
                  <a href={data.quotePath}>Enquire about this range <ArrowRightIcon /></a>
                </li>;
              })}
            </ol>
          </section>
        ) : null}

        <section className={styles.overview} aria-labelledby="product-overview-title">
          <div><p>04 / Product information</p><h2 id="product-overview-title">Product overview</h2></div>
          <div className={styles.overviewCopy}><p>{product.description ?? product.shortDescription}</p>{product.benefits?.length ? <ul>{product.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul> : null}</div>
        </section>

        {showSupply ? (
          <section className={styles.supply} aria-labelledby="product-supply-title">
            <header className={styles.sectionHeading}><p>05 / Product resources</p><div><h2 id="product-supply-title">Packs and technical documents</h2></div></header>
            <div className={styles.supplyGrid}>
              {packagedVariants.length ? <div><span className={styles.panelLabel}>Recorded pack sizes</span><dl>{packagedVariants.map((variant) => <div key={variant.id}><dt>{variant.name}</dt><dd>{variant.packSize?.value} {variant.packUnit}</dd></div>)}</dl></div> : null}
              {product.documents.length ? <div><span className={styles.panelLabel}>Verified resources</span><ul>{product.documents.map((document) => <li key={document.id}><a href={document.fileUrl}>View {document.title}<ArrowRightIcon /></a></li>)}</ul></div> : null}
            </div>
          </section>
        ) : null}

        <aside className={styles.verificationNotice} aria-labelledby="product-notice-title">
          <span aria-hidden="true">i</span><div><h2 id="product-notice-title">Technical information notice</h2><p>Technical classifications and product details shown are based on current catalogue information and remain subject to final product verification. Confirm suitability and current supply options with Haribol Lubes Limited before selection.</p></div>
        </aside>

        {data.relatedProducts.length ? (
          <section className={styles.related} aria-labelledby="related-products-title">
            <header className={styles.sectionHeading}><p>06 / Continue exploring</p><div><h2 id="related-products-title">Related catalogue products</h2><p>Current relationships based on catalogue category and application data.</p></div></header>
            <ul>{data.relatedProducts.map((relatedProduct, index) => {
              const relatedImage = [...relatedProduct.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
              return <li key={relatedProduct.id}><a href={getProductPath(relatedProduct)}><span className={styles.relatedIndex}>{String(index + 1).padStart(2, "0")}</span><div className={styles.relatedVisual}>{relatedImage ? <Image alt="" height={180} sizes="8rem" src={relatedImage.src} width={140} /> : <ProductTechnicalFallback category={data.category.name} />}</div><div><h3>{relatedProduct.name}</h3><p>{relatedProduct.shortDescription}</p></div><ArrowRightIcon /></a></li>;
            })}</ul>
          </section>
        ) : null}

        <section className={styles.enquiry} aria-labelledby="product-enquiry-title">
          <div><p>07 / Product enquiry</p><h2 id="product-enquiry-title">Discuss this product with Haribol</h2><span>Share the application, preferred grade and expected volume for a technical and commercial response.</span></div>
          <div className={styles.enquiryActions}>
            <a className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.large}`} href={data.quotePath}>Request a Quote<ArrowRightIcon /></a>
            <WhatsAppLink className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`} context={whatsappContext} source="product-page">Ask on WhatsApp</WhatsAppLink>
            <a className={`${buttonStyles.button} ${buttonStyles.ghost} ${buttonStyles.large}`} href="/contact">Contact Haribol</a>
          </div>
        </section>
      </PageContainer>
    </article>
  );
}
