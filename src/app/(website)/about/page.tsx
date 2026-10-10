import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { PageContainer } from "@/components/ui/page-container";
import { siteConfig } from "@/config/site";
import { featuredBrand } from "@/data/brands";
import { catalogueCategories } from "@/data/catalogue/categories";
import { industries } from "@/data/industries";
import { mastermaxCatalogueTaxonomy } from "@/data/mastermax-catalogue";
import { createMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbSchema, createPageSchema, createSchemaGraph, JsonLd } from "@/lib/seo/structured-data";

import styles from "./page.module.css";

export const metadata: Metadata = createMetadata({
  absoluteTitle: "About Haribol Lubes Limited | Lubricant Supplier Kenya",
  description:
    "Learn about Haribol Lubes Limited, an automotive and industrial lubricant supplier operating from Mlolongo, Kenya, and featuring the Mastermax lubricant range.",
  path: "/about",
});

const currentCategoryIds = [
  "engine-oils",
  "hydraulic-oils",
  "transmission-gear-oils",
  "compressor-oils",
  "industrial-lubricants",
  "greases",
] as const;

const currentCategories = currentCategoryIds.flatMap((categoryId) => {
  const category = catalogueCategories.find((entry) => entry.id === categoryId);
  return category ? [category] : [];
});

const commercialIndustryIds = [
  "garages-workshops",
  "fleet-operators",
  "transport-logistics",
  "manufacturing",
  "construction",
  "agriculture",
  "wholesale-retail",
] as const;

const commercialIndustries = commercialIndustryIds.flatMap((industryId) => {
  const industry = industries.find((entry) => entry.id === industryId);
  return industry ? [industry] : [];
});

const serviceAreas = [
  {
    index: "01",
    title: "Automotive lubricants",
    body: "Catalogue access across engine, transmission and gear lubricant groups for automotive and commercial requirements.",
  },
  {
    index: "02",
    title: "Industrial lubricants",
    body: "Structured product groups for hydraulic, compressor, machinery, process and grease applications.",
  },
  {
    index: "03",
    title: "Commercial enquiries",
    body: "Clear enquiry routes for trade, fleet, reseller and larger-volume lubricant requirements.",
  },
  {
    index: "04",
    title: "Product selection",
    body: "Catalogue data, technical documents and guided tools that help narrow relevant product families.",
  },
  {
    index: "05",
    title: "Brand distribution",
    body: "A company-led catalogue architecture with Mastermax as the current featured lubricant brand.",
  },
] as const;

function KenyaReference() {
  return (
    <section className={styles.kenyaVisual} aria-label="Verified Haribol business location">
      <div className={styles.mapMeta}><span>Verified business address</span><span>MLO · KE</span></div>
      <div className={styles.locationMark} aria-hidden="true"><span>●</span><strong>MLOLONGO</strong><small>OPERATING BASE / KENYA</small></div>
      <address className={styles.verifiedAddress}><strong>{siteConfig.businessAddress.venue}</strong><span>{siteConfig.businessAddress.street}</span><span>{siteConfig.businessAddress.locality}, {siteConfig.businessAddress.country}</span></address>
      <a className={styles.directionsLink} href={siteConfig.businessAddress.mapsUrl} rel="noopener noreferrer" target="_blank">Get Directions <span aria-hidden="true">↗</span></a>
    </section>
  );
}

export default function AboutPage() {
  return (
    <article className={styles.page}>
      <JsonLd data={createSchemaGraph([
        createPageSchema({ type: "AboutPage", path: "/about", name: "About Haribol Lubes Limited", description: "Company overview, operating focus and current lubricant catalogue." }),
        createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }]),
      ])} />
      <section className={styles.hero} aria-labelledby="about-title">
        <PageContainer className={styles.heroContainer} size="wide">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>About Haribol</p>
              <h1 id="about-title">{siteConfig.companyName}</h1>
              <p className={styles.heroStatement}>
                Automotive and industrial lubricant supply from {siteConfig.city}, {siteConfig.country}.
              </p>
            </div>
            <aside className={styles.heroReference} aria-label="Company operating focus">
              <div className={styles.referenceCode} aria-hidden="true">
                <span>MLO</span><i /><span>KE</span>
              </div>
              <p>Built around product access, technical clarity and commercial support.</p>
              <dl>
                <div><dt>Current base</dt><dd>{siteConfig.city}</dd></div>
                <div><dt>Primary market</dt><dd>{siteConfig.country}</dd></div>
                <div><dt>Featured brand</dt><dd>{featuredBrand.name}</dd></div>
              </dl>
            </aside>
          </div>
        </PageContainer>
      </section>

      <section className={styles.overview} aria-labelledby="company-overview-title">
        <PageContainer className={styles.overviewGrid} size="wide">
          <header className={styles.sectionHeading}>
            <p><span>01</span> Company overview</p>
            <h2 id="company-overview-title">A lubricant business with a clear current focus.</h2>
          </header>
          <div className={styles.overviewCopy}>
            <p>
              {siteConfig.companyName} operates from {siteConfig.city} and focuses on automotive and industrial lubricant supply and distribution for commercial, workshop, fleet and industrial requirements.
            </p>
            <p>
              The current catalogue brings product groups, applications and technical information into one structure, with direct routes for product exploration and commercial enquiries.
            </p>
          </div>
          <ul className={styles.categoryRail} aria-label="Current Haribol product groups">
            {currentCategories.map((category, index) => (
              <li key={category.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Link href={`/products/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section className={styles.services} aria-labelledby="services-title">
        <PageContainer size="wide">
          <header className={styles.sectionHeading}>
            <p><span>02</span> What we do</p>
            <h2 id="services-title">Supply, catalogue clarity and commercial enquiry.</h2>
          </header>
          <ol className={styles.serviceGrid}>
            {serviceAreas.map((area) => (
              <li key={area.index}>
                <span>{area.index}</span><h3>{area.title}</h3><p>{area.body}</p>
              </li>
            ))}
          </ol>
          <div className={styles.serviceLinks}>
            <Link href="/products">Explore the product catalogue <span aria-hidden="true">↗</span></Link>
            <Link href="/product-finder">Use the Product Finder <span aria-hidden="true">↗</span></Link>
          </div>
        </PageContainer>
      </section>

      <section className={styles.brandSection} aria-labelledby="mastermax-relationship-title">
        <PageContainer className={styles.brandGrid} size="wide">
          <div className={styles.brandCopy}>
            <p className={styles.orangeEyebrow}>03 / Current featured brand</p>
            <h2 id="mastermax-relationship-title">Mastermax within Haribol.</h2>
            <p>
              {featuredBrand.name} is the current featured lubricant brand within {siteConfig.companyName}&apos;s catalogue. The company identity remains {siteConfig.companyName}.
            </p>
            <Link href={featuredBrand.futureHref}>Explore Mastermax <span aria-hidden="true">↗</span></Link>
          </div>
          <div className={styles.brandArchitecture} aria-label="Current Haribol brand architecture">
            <div className={styles.architectureHeader}><span>Brand architecture</span><span>Current / Scalable</span></div>
            <div className={styles.companyNode}><small>Company</small><strong>{siteConfig.companyName}</strong></div>
            <div className={styles.architectureLine} aria-hidden="true"><span /></div>
            <div className={styles.brandNodes}>
              <div className={styles.mastermaxNode}><small>Featured brand / 01</small><strong>{featuredBrand.name}</strong></div>
              <div className={styles.futureNode}><small>Future capacity</small><strong>Additional brands</strong><span>May be added later</span></div>
            </div>
            <ul className={styles.brandGroups} aria-label="Current Mastermax product groups">
              {mastermaxCatalogueTaxonomy.map((group, index) => (
                <li key={group.id}><span>{String(index + 1).padStart(2, "0")}</span>{group.category}</li>
              ))}
            </ul>
          </div>
        </PageContainer>
      </section>

      <section className={styles.commercial} aria-labelledby="commercial-title">
        <PageContainer size="wide">
          <header className={styles.commercialHeading}>
            <div className={styles.sectionHeading}>
              <p><span>04</span> Commercial focus</p>
              <h2 id="commercial-title">Structured around real enquiry contexts.</h2>
            </div>
            <p>
              Haribol&apos;s catalogue and enquiry structure is designed around the needs of workshops, fleets, transport businesses, industrial buyers, construction-related customers, agricultural users, wholesalers and resellers.
            </p>
          </header>
          <ul className={styles.industryList}>
            {commercialIndustries.map((industry) => (
              <li key={industry.id}><span>{industry.displayIndex}</span><h3>{industry.name}</h3><p>{industry.shortDescription}</p></li>
            ))}
          </ul>
          <div className={styles.commercialLinks}>
            <Link href="/industries">Explore industries</Link><Link href="/contact">Contact Haribol</Link>
          </div>
        </PageContainer>
      </section>

      <section className={styles.kenyaSection} aria-labelledby="kenya-focus-title">
        <PageContainer className={styles.kenyaGrid} size="wide">
          <KenyaReference />
          <div className={styles.kenyaCopy}>
            <p className={styles.eyebrow}>05 / Kenya focus</p>
            <h2 id="kenya-focus-title">Operating from Mlolongo. Focused on Kenya. Built to scale.</h2>
            <p>
              {siteConfig.city} is Haribol&apos;s current business base, and {siteConfig.country} is the primary current market. The website and catalogue are structured so additional East African markets can be introduced later as the business grows.
            </p>
            <dl>
              <div><dt>Current business base</dt><dd>{siteConfig.city}</dd></div>
              <div><dt>Primary current market</dt><dd>{siteConfig.country}</dd></div>
              <div><dt>Regional status</dt><dd>Future architecture</dd></div>
            </dl>
          </div>
        </PageContainer>
      </section>

      <section className={styles.growth} aria-labelledby="growth-title">
        <PageContainer className={styles.growthGrid} size="wide">
          <p><span>06</span> Direction of growth</p>
          <div>
            <h2 id="growth-title">Built with room for what comes next.</h2>
            <p>
              The platform and catalogue are being structured to support additional brands, broader technical content and future East African market expansion as the business grows.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className={styles.cta} aria-labelledby="about-cta-title">
        <PageContainer className={styles.ctaGrid} size="wide">
          <div><p>Product and commercial enquiries</p><h2 id="about-cta-title">Discuss your lubricant requirement.</h2></div>
          <div className={styles.ctaActions}>
            <Link href="/request-a-quote">Request a Quote <span aria-hidden="true">↗</span></Link>
            <Link href="/products">Explore Products</Link>
          </div>
        </PageContainer>
      </section>
    </article>
  );
}
