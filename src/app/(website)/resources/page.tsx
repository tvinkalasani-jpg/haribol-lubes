import Link from "next/link";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { PageContainer } from "@/components/ui/page-container";
import { getPublicResources } from "@/features/content/content-repository";
import { formatEditorialDate, resourceTypeLabel } from "@/features/content/presentation";
import { createMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbSchema, createPageSchema, createSchemaGraph, JsonLd } from "@/lib/seo/structured-data";

import styles from "@/components/content/content.module.css";

export const metadata = createMetadata({
  title: "Technical Resources",
  description: "Approved technical documents and product resources from Haribol Lubes Limited.",
  path: "/resources",
});

export const revalidate = 3600;

export default async function ResourcesPage() {
  const resources = await getPublicResources();
  return (
    <div className={styles.contentPage}>
      <JsonLd data={createSchemaGraph([
        createPageSchema({ type: "CollectionPage", path: "/resources", name: "Technical Resources", description: "Approved technical documents and product resources from Haribol Lubes Limited." }),
        createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }]),
      ])} />
      <PageContainer size="wide">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources" }]} />
        <header className={styles.resourceHero}>
          <div><p className="eyebrow">Controlled document library</p><h1>Technical resources</h1></div>
          <p>One reviewed source for product literature, technical data and safety documentation.</p>
        </header>

        {resources.length ? (
          <section className={styles.resourceList} aria-labelledby="resource-list-heading">
            <div className={styles.sectionHeading}><div><p className="eyebrow">Available now</p><h2 id="resource-list-heading">Approved downloads</h2></div></div>
            {resources.map((resource) => (
              <article key={resource.id}>
                <div><span>{resourceTypeLabel(resource.resourceType)}</span><h2>{resource.title}</h2><p>{resource.description}</p></div>
                <dl><div><dt>Language</dt><dd>{resource.language.toUpperCase()}</dd></div>{resource.version ? <div><dt>Version</dt><dd>{resource.version}</dd></div> : null}{resource.effectiveDate ? <div><dt>Effective</dt><dd>{formatEditorialDate(resource.effectiveDate)}</dd></div> : null}</dl>
                {resource.downloadHref ? <a className={styles.primaryLink} href={resource.downloadHref} target="_blank" rel="noreferrer">Open document <span aria-hidden="true">↗</span></a> : null}
              </article>
            ))}
          </section>
        ) : (
          <section className={styles.resourceEmpty} aria-labelledby="resource-empty-heading">
            <div className={styles.emptyMark} aria-hidden="true"><span>DOC</span><span>00</span></div>
            <div><p className="eyebrow">Library status</p><h2 id="resource-empty-heading">Approved technical documents and product resources will appear here as they become available.</h2><p>For a current product enquiry or a specific document request, use one of the guided routes below.</p></div>
          </section>
        )}

        <nav className={styles.resourcePaths} aria-label="Alternative resource pathways">
          <Link href="/products"><span>01</span><strong>Browse products</strong><small>Review the current catalogue</small></Link>
          <Link href="/product-finder"><span>02</span><strong>Product Finder</strong><small>Narrow by application</small></Link>
          <Link href="/contact"><span>03</span><strong>Contact</strong><small>Ask for technical support</small></Link>
          <Link href="/request-a-quote"><span>04</span><strong>Request a quote</strong><small>Share a commercial requirement</small></Link>
        </nav>
      </PageContainer>
    </div>
  );
}
