import Link from "next/link";

import { ArrowRightIcon } from "@/components/ui/icons";
import { PageContainer } from "@/components/ui/page-container";
import { getReadingTime } from "@/features/content/content-repository";
import { insightCategoryLabel, resourceTypeLabel } from "@/features/content/presentation";
import type { InsightRecord, ResourceRecord } from "@/features/content/types";

import styles from "./knowledge-section.module.css";

type KnowledgeSectionProps = {
  insights: readonly InsightRecord[];
  resources: readonly ResourceRecord[];
};

export function KnowledgeSection({ insights, resources }: KnowledgeSectionProps) {
  const publishedInsights = insights.slice(0, 2);
  const approvedResources = resources.slice(0, 2);
  const hasPublishedContent = publishedInsights.length > 0 || approvedResources.length > 0;

  return (
    <section className={styles.section} aria-labelledby="home-knowledge-title">
      <PageContainer className={styles.container} size="wide">
        <header className={styles.heading}>
          <p className={styles.eyebrow}><span>09</span>Resources &amp; insights</p>
          <div>
            <h2 id="home-knowledge-title">Technical information, <span>reviewed before publication.</span></h2>
            <p>Explore approved documents and practical lubricant guidance as Haribol&apos;s technical library develops.</p>
          </div>
        </header>

        {hasPublishedContent ? (
          <div className={styles.contentGrid}>
            <div className={styles.editorialColumn}>
              <div className={styles.columnHeading}><span>Insights</span><Link href="/insights">View all</Link></div>
              {publishedInsights.map((insight) => (
                <article key={insight.id}>
                  <p>{insightCategoryLabel(insight.category)} · {getReadingTime(insight.content)} min read</p>
                  <h3><Link href={`/insights/${insight.slug}`}>{insight.title}</Link></h3>
                  <span>{insight.excerpt}</span>
                </article>
              ))}
              {!publishedInsights.length ? <p className={styles.emptyCopy}>Reviewed insights will appear here when published.</p> : null}
            </div>

            <div className={styles.resourceColumn}>
              <div className={styles.columnHeading}><span>Technical library</span><Link href="/resources">View all</Link></div>
              {approvedResources.map((resource) => (
                <article key={resource.id}>
                  <span className={styles.documentMark}>DOC</span>
                  <div><p>{resourceTypeLabel(resource.resourceType)}</p><h3>{resource.title}</h3><span>{resource.description}</span></div>
                  {resource.downloadHref ? <a href={resource.downloadHref} rel="noreferrer" target="_blank" aria-label={`Open ${resource.title}`}><ArrowRightIcon /></a> : null}
                </article>
              ))}
              {!approvedResources.length ? <p className={styles.emptyCopy}>Approved technical documents will appear here when available.</p> : null}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div aria-hidden="true"><span>LIB</span><strong>00</strong></div>
            <p>Reviewed insights and approved technical documents will appear here as the knowledge base develops.</p>
            <nav aria-label="Technical information pathways">
              <Link href="/resources">Browse Resources <ArrowRightIcon /></Link>
              <Link href="/insights">View Insights <ArrowRightIcon /></Link>
              <Link href="/product-finder">Use Product Finder <ArrowRightIcon /></Link>
            </nav>
          </div>
        )}
      </PageContainer>
    </section>
  );
}
