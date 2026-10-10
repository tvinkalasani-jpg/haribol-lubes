import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { InsightCard } from "@/components/content/insight-card";
import { RichText } from "@/components/content/rich-text";
import { PageContainer } from "@/components/ui/page-container";
import { getPublicInsight, getPublicInsights, getReadingTime, getRelatedInsights } from "@/features/content/content-repository";
import { formatEditorialDate, insightCategoryLabel } from "@/features/content/presentation";
import { createMetadata } from "@/lib/seo/metadata";
import { createArticleSchema, createBreadcrumbSchema, createPageSchema, createSchemaGraph, JsonLd } from "@/lib/seo/structured-data";

import styles from "@/components/content/content.module.css";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = await getPublicInsight(slug);
  if (!insight) return {};
  return createMetadata({
    title: insight.seo.metaTitle || insight.title,
    description: insight.seo.metaDescription || insight.excerpt,
    path: insight.seo.canonicalOverride || `/insights/${insight.slug}`,
    type: "article",
    indexable: insight.seo.indexable,
  });
}

export default async function InsightDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [insight, allInsights] = await Promise.all([getPublicInsight(slug), getPublicInsights()]);
  if (!insight) notFound();
  const related = getRelatedInsights(insight, allInsights);
  const publicationDate = formatEditorialDate(insight.publishedAt);
  const selectionArticle = insight.category === "product-selection" || insight.category === "technical-guides";

  return (
    <div className={styles.contentPage}>
      <JsonLd data={createSchemaGraph([
        createPageSchema({ path: `/insights/${insight.slug}`, name: insight.title, description: insight.seo.metaDescription || insight.excerpt }),
        createArticleSchema(insight),
        createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }, { name: insight.title, path: `/insights/${insight.slug}` }]),
      ])} />
      <PageContainer size="wide">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Insights", href: "/insights" }, { label: insight.title }]} />
      </PageContainer>
      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <PageContainer size="wide">
            <p className="eyebrow">{insightCategoryLabel(insight.category)}</p>
            <h1>{insight.title}</h1>
            <p className={styles.articleExcerpt}>{insight.excerpt}</p>
            <dl className={styles.articleMeta}>
              <div><dt>By</dt><dd>{insight.byline}</dd></div>
              {publicationDate ? <div><dt>Published</dt><dd><time dateTime={insight.publishedAt}>{publicationDate}</time></dd></div> : null}
              <div><dt>Reading time</dt><dd>{getReadingTime(insight.content)} minutes</dd></div>
            </dl>
          </PageContainer>
        </header>

        {insight.heroImage ? (
          <PageContainer size="wide"><figure className={styles.heroMedia}><Image src={insight.heroImage.url} alt={insight.heroImage.alt} width={insight.heroImage.width ?? 1600} height={insight.heroImage.height ?? 900} sizes="(max-width: 768px) 100vw, 90vw" priority /></figure></PageContainer>
        ) : null}

        <PageContainer size="narrow">
          <RichText data={insight.content} />
        </PageContainer>

        {(insight.relatedProducts.length || insight.relatedCategories.length || insight.relatedIndustries.length || insight.relatedApplications.length) ? (
          <PageContainer size="wide">
            <aside className={styles.contextPanel} aria-labelledby="related-context-heading">
              <div><p className="eyebrow">Connected knowledge</p><h2 id="related-context-heading">Continue in context</h2></div>
              <div className={styles.contextGroups}>
                {insight.relatedProducts.length ? <RelationshipGroup label="Products" items={insight.relatedProducts} /> : null}
                {insight.relatedCategories.length ? <RelationshipGroup label="Categories" items={insight.relatedCategories} /> : null}
                {insight.relatedIndustries.length ? <RelationshipGroup label="Industries" items={insight.relatedIndustries} /> : null}
                {insight.relatedApplications.length ? <RelationshipGroup label="Applications" items={insight.relatedApplications} /> : null}
              </div>
            </aside>
          </PageContainer>
        ) : null}

        {related.length ? (
          <PageContainer size="wide"><section className={styles.relatedSection} aria-labelledby="related-insights"><div className={styles.sectionHeading}><div><p className="eyebrow">Related insights</p><h2 id="related-insights">Read next</h2></div></div><div className={styles.articleList}>{related.map((entry) => <InsightCard key={entry.id} insight={entry} />)}</div></section></PageContainer>
        ) : null}

        <PageContainer size="wide">
          <section className={styles.finalCta}>
            <div><p className="eyebrow">Next practical step</p><h2>{selectionArticle ? "Narrow the requirement by application." : "Discuss the requirement with Haribol."}</h2></div>
            <div><p>Technical articles provide general context. Confirm product suitability for the actual equipment, specification and operating conditions.</p><Link className={styles.primaryLink} href={selectionArticle ? "/product-finder" : "/request-a-quote"}>{selectionArticle ? "Use Product Finder" : "Request a quote"}</Link></div>
          </section>
        </PageContainer>
      </article>
    </div>
  );
}

function RelationshipGroup({ label, items }: { label: string; items: readonly { href: string; id: string; title: string }[] }) {
  return <section><h3>{label}</h3><ul>{items.map((item) => <li key={item.id}><Link href={item.href}>{item.title}<span aria-hidden="true">↗</span></Link></li>)}</ul></section>;
}
