import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { PageContainer } from "@/components/ui/page-container";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import {
  applications,
  catalogueCategories,
  getProductsByIndustry,
} from "@/data/catalogue";
import { getIndustryById, industries, type Industry } from "@/data/industries";

import styles from "./industry-pages.module.css";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function IndustryMotif({ industry }: { industry: Industry }) {
  return (
    <div className={`${styles.motif} ${styles[industry.visualVariant]}`} aria-hidden="true">
      <div className={styles.motifMeta}>
        <span>Sector reference</span>
        <span>KE / {industry.displayIndex}</span>
      </div>
      <div className={styles.motifCore}>
        <span>{industry.displayIndex}</span>
        <i />
        <b>{industry.name}</b>
      </div>
      <div className={styles.motifScale}>
        <span>Application</span><i /><span>Equipment</span><i /><span>Product</span>
      </div>
    </div>
  );
}

function SectionHeading({ index, label, title }: { index: string; label: string; title: string }) {
  return (
    <header className={styles.sectionHeading}>
      <p><span>{index}</span>{label}</p>
      <h2>{title}</h2>
    </header>
  );
}

export function IndustryLandingPage({ industry }: { industry: Industry }) {
  const categoryRecords = catalogueCategories.filter((category) =>
    industry.relevantCategoryIds.includes(category.id),
  );
  const matchedProducts = getProductsByIndustry(industry.id);
  const matchedApplicationIds = new Set(matchedProducts.flatMap((product) => product.applicationIds));
  const matchedApplications = applications.filter((application) =>
    matchedApplicationIds.has(application.id),
  );
  const relatedIndustries = industry.relatedIndustryIds.flatMap((id) => {
    const related = getIndustryById(id);
    return related ? [related] : [];
  });

  return (
    <article className={styles.page}>
      <section className={styles.hero} aria-labelledby="industry-title">
        <PageContainer className={styles.heroContainer} size="wide">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Industries", href: "/industries" }, { label: industry.name }]} />
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Industry / {industry.displayIndex}</p>
              <h1 id="industry-title">{industry.pageTitle}</h1>
              <p className={styles.intro}>{industry.intro}</p>
              <p className={styles.marketLine}>Catalogue context for Kenya · Current market focus</p>
            </div>
            <IndustryMotif industry={industry} />
          </div>
        </PageContainer>
      </section>

      <section className={styles.requirements} aria-labelledby="requirements-title">
        <PageContainer className={styles.sectionGrid} size="wide">
          <SectionHeading index="01" label="Typical requirements" title="Start with the operating requirement." />
          <ol className={styles.requirementList} id="requirements-title">
            {industry.requirementPoints.map((requirement, index) => (
              <li key={requirement}><span>{String(index + 1).padStart(2, "0")}</span><p>{requirement}</p></li>
            ))}
          </ol>
        </PageContainer>
      </section>

      <section className={styles.categories} aria-labelledby="categories-title">
        <PageContainer size="wide">
          <SectionHeading index="02" label="Relevant categories" title="Current catalogue pathways." />
          <div className={styles.categoryGrid} id="categories-title">
            {categoryRecords.map((category, index) => (
              <a href={`/products/${category.slug}`} key={category.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <Arrow />
              </a>
            ))}
          </div>
          <p className={styles.categoryNote}>Categories indicate useful catalogue starting points. They do not establish compatibility with a particular vehicle or machine.</p>
        </PageContainer>
      </section>

      <section className={styles.products} aria-labelledby="products-title">
        <PageContainer size="wide">
          <div className={styles.productHeading}>
            <SectionHeading index="03" label="Current catalogue matches" title="Structured Mastermax relationships." />
            <p>Shown only where the current product data explicitly links a Mastermax range to this industry.</p>
          </div>
          {matchedProducts.length > 0 ? (
            <div className={styles.productGrid} id="products-title">
              {matchedProducts.map((product, index) => (
                <a href={`/products/${product.primaryCategoryId}/${product.slug}`} key={product.id}>
                  <div className={styles.productMeta}><span>MM / {String(index + 1).padStart(2, "0")}</span><span>Current catalogue</span></div>
                  <h3>{product.name}</h3>
                  <p>{product.shortDescription}</p>
                  <span className={styles.productLink}>View product range <Arrow /></span>
                </a>
              ))}
            </div>
          ) : (
            <div className={styles.noProducts} id="products-title">
              <p>No product-level industry relationship is currently declared in the catalogue data.</p>
              <span>Use the category routes above or contact Haribol to discuss the requirement.</span>
            </div>
          )}
          <a className={styles.brandLink} href="/brands/mastermax">Explore the Mastermax range <Arrow /></a>
        </PageContainer>
      </section>

      {matchedApplications.length > 0 && (
        <section className={styles.applications} aria-labelledby="applications-title">
          <PageContainer className={styles.applicationGrid} size="wide">
            <SectionHeading index="04" label="Supported applications" title="Application references in current data." />
            <ul id="applications-title">
              {matchedApplications.map((application, index) => (
                <li key={application.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{application.name}</strong><p>{application.description}</p></li>
              ))}
            </ul>
          </PageContainer>
        </section>
      )}

      <section className={styles.selection} aria-labelledby="selection-title">
        <PageContainer className={styles.selectionGrid} size="wide">
          <div><p>Product selection / Technical note</p><h2 id="selection-title">Check the required grade and specification.</h2></div>
          <div>
            <p>Product selection depends on the equipment manufacturer&apos;s required grade, specification and operating conditions. Haribol can help narrow the current catalogue, but final compatibility should be checked against the relevant manufacturer specification.</p>
            <a href="/product-finder">Find a Product <Arrow /></a>
          </div>
        </PageContainer>
      </section>

      <section className={styles.related} aria-labelledby="related-title">
        <PageContainer size="wide">
          <SectionHeading index="05" label="Related industries" title="Continue by operating context." />
          <div className={styles.relatedGrid} id="related-title">
            {relatedIndustries.map((related) => (
              <a href={related.futureHref} key={related.id}><span>{related.displayIndex}</span><h3>{related.name}</h3><p>{related.shortDescription}</p><Arrow /></a>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className={styles.cta} aria-labelledby="industry-cta-title">
        <PageContainer className={styles.ctaGrid} size="wide">
          <div><p>Commercial enquiry</p><h2 id="industry-cta-title">Discuss the lubricant requirement.</h2></div>
          <div className={styles.ctaActions}>
            <a href="/request-a-quote">Request a Quote <Arrow /></a>
            <WhatsAppLink context={{ type: "industry", industryName: industry.name }} source="industry-page">Talk to Sales on WhatsApp <Arrow /></WhatsAppLink>
            <a href="/contact">Contact Haribol <Arrow /></a>
          </div>
        </PageContainer>
      </section>
    </article>
  );
}

export function IndustryIndexPage() {
  return (
    <article className={styles.page}>
      <section className={`${styles.hero} ${styles.indexHero}`} aria-labelledby="industries-title">
        <PageContainer className={styles.heroContainer} size="wide">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Industries" }]} />
          <div className={styles.indexHeroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Industries / 09 sectors</p>
              <h1 id="industries-title">Lubricant requirements by industry.</h1>
            </div>
            <p className={styles.indexIntro}>Explore automotive, commercial and industrial catalogue pathways organised around common equipment and application contexts in Kenya.</p>
          </div>
        </PageContainer>
      </section>
      <section className={styles.indexDirectory} aria-label="Industry directory">
        <PageContainer size="wide">
          <ol>
            {industries.map((industry) => (
              <li key={industry.id}>
                <a href={industry.futureHref}>
                  <span className={styles.indexNumber}>{industry.displayIndex}</span>
                  <div className={`${styles.indexMark} ${styles[industry.visualVariant]}`} aria-hidden="true"><i /><i /></div>
                  <div><h2>{industry.name}</h2><p>{industry.shortDescription}</p></div>
                  <Arrow />
                </a>
              </li>
            ))}
          </ol>
        </PageContainer>
      </section>
      <section className={styles.cta} aria-labelledby="index-cta-title">
        <PageContainer className={styles.ctaGrid} size="wide">
          <div><p>Product and commercial enquiries</p><h2 id="index-cta-title">Start with the sector. Continue with the requirement.</h2></div>
          <div className={styles.ctaActions}><a href="/request-a-quote">Request a Quote <Arrow /></a><a href="/product-finder">Open Product Finder <Arrow /></a><a href="/contact">Contact Haribol <Arrow /></a></div>
        </PageContainer>
      </section>
    </article>
  );
}
