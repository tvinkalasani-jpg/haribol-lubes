import Link from "next/link";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { InsightCard } from "@/components/content/insight-card";
import { PageContainer } from "@/components/ui/page-container";
import { insightCategories } from "@/cms/content";
import { getPublicInsights } from "@/features/content/content-repository";
import { createMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbSchema, createPageSchema, createSchemaGraph, JsonLd } from "@/lib/seo/structured-data";

import styles from "@/components/content/content.module.css";

export const metadata = createMetadata({
  title: "Insights",
  description: "Practical lubricant knowledge, technical guides and product-selection context from Haribol Lubes Limited.",
  path: "/insights",
});

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const insights = await getPublicInsights();
  const featured = insights.find((entry) => entry.featured);
  const latest = insights.filter(({ id }) => id !== featured?.id);

  return (
    <div className={styles.contentPage}>
      <JsonLd data={createSchemaGraph([
        createPageSchema({ type: "CollectionPage", path: "/insights", name: "Insights", description: "Practical lubricant knowledge and technical guides from Haribol Lubes Limited." }),
        createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }]),
      ])} />
      <PageContainer size="wide">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Insights" }]} />
        <header className={styles.indexHero}>
          <p className="eyebrow">Knowledge for moving systems</p>
          <h1>Technical insight.<br /><span>Practical decisions.</span></h1>
          <p>Clear guidance for lubricant selection, maintenance conversations and commercial procurement in Kenya.</p>
        </header>
      </PageContainer>

      <PageContainer size="wide">
        {featured ? (
          <section className={styles.featuredSection} aria-labelledby="featured-insight">
            <div className={styles.sectionLabel}><span>01</span><p>Featured insight</p></div>
            <div id="featured-insight"><InsightCard insight={featured} featured /></div>
          </section>
        ) : null}

        <section className={styles.latestSection} aria-labelledby="latest-insights">
          <div className={styles.sectionHeading}>
            <div><p className="eyebrow">Latest thinking</p><h2 id="latest-insights">Field notes and technical guides</h2></div>
            <p>Editorial content is reviewed before it is made public. Technical topics carry an additional verification gate.</p>
          </div>
          {latest.length ? (
            <div className={styles.articleList}>{latest.map((insight) => <InsightCard key={insight.id} insight={insight} />)}</div>
          ) : !featured ? (
            <div className={styles.emptyEditorial}>
              <p>Reviewed insights will appear here as the Haribol technical knowledge base develops.</p>
              <Link className={styles.primaryLink} href="/product-finder">Use the Product Finder</Link>
            </div>
          ) : null}
        </section>

        <section className={styles.categorySection} aria-labelledby="insight-categories">
          <div className={styles.sectionLabel}><span>02</span><p id="insight-categories">Knowledge areas</p></div>
          <ul>{insightCategories.map(({ label, value }, index) => <li key={value}><span>{String(index + 1).padStart(2, "0")}</span>{label}</li>)}</ul>
        </section>

        <div className={styles.pathwayGrid}>
          <section><p className="eyebrow">Technical library</p><h2>Approved documents, in one place.</h2><p>Find technical data, safety information and product resources when approved files are available.</p><Link className={styles.textLink} href="/resources">Browse resources →</Link></section>
          <section><p className="eyebrow">Product selection</p><h2>Start with the application.</h2><p>Use structured questions to narrow the catalogue before confirming suitability with our team.</p><Link className={styles.textLink} href="/product-finder">Open Product Finder →</Link></section>
        </div>

        <section className={styles.finalCta}>
          <div><p className="eyebrow">Talk through the requirement</p><h2>Need help interpreting a specification?</h2></div>
          <div><p>Share the application, operating context and known technical requirement with Haribol Lubes.</p><Link className={styles.primaryLink} href="/contact">Contact our team</Link></div>
        </section>
      </PageContainer>
    </div>
  );
}
