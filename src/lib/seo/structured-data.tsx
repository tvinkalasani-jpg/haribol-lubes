import type { ReactElement } from "react";

import { siteConfig } from "@/config/site";
import { canonicalBusinessRecord } from "@/config/business";
import type { InsightRecord } from "@/features/content/types";
import { createCanonicalUrl } from "@/lib/seo/canonical";

export type SchemaNode = Record<string, unknown>;
export type BreadcrumbSchemaItem = { name: string; path: string };

const organizationId = `${siteConfig.domain}/#organization`;
const websiteId = `${siteConfig.domain}/#website`;

function withoutEmpty<T extends SchemaNode>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== ""),
  ) as T;
}

export function createOrganizationSchema(): SchemaNode {
  const sameAs = Object.values(siteConfig.socialLinks).filter((url) => /^https:\/\//.test(url));
  return withoutEmpty({
    "@type": "Organization",
    "@id": organizationId,
    name: canonicalBusinessRecord.shortName,
    legalName: canonicalBusinessRecord.name,
    url: canonicalBusinessRecord.website,
    telephone: canonicalBusinessRecord.whatsapp.replace(/\s/g, ""),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${canonicalBusinessRecord.address.venue}, ${canonicalBusinessRecord.address.street}`,
      addressLocality: canonicalBusinessRecord.address.locality,
      addressCountry: canonicalBusinessRecord.address.countryCode,
    },
    sameAs: sameAs.length ? sameAs : undefined,
  });
}

export function createWebsiteSchema(): SchemaNode {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    name: siteConfig.shortName,
    url: siteConfig.domain,
    publisher: { "@id": organizationId },
  };
}

export function createBreadcrumbSchema(items: readonly BreadcrumbSchemaItem[]): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: createCanonicalUrl(item.path),
    })),
  };
}

export function createPageSchema({
  type = "WebPage",
  path,
  name,
  description,
}: {
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  path: string;
  name: string;
  description: string;
}): SchemaNode {
  const url = createCanonicalUrl(path);
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { "@id": websiteId },
    about: { "@id": organizationId },
  };
}

export function createArticleSchema(insight: InsightRecord): SchemaNode {
  const url = createCanonicalUrl(`/insights/${insight.slug}`);
  return withoutEmpty({
    "@type": "Article",
    "@id": `${url}#article`,
    headline: insight.title,
    description: insight.seo.metaDescription || insight.excerpt,
    datePublished: insight.publishedAt,
    dateModified: insight.updatedAt || insight.publishedAt,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    author: { "@id": organizationId },
    publisher: { "@id": organizationId },
    image: insight.heroImage?.url ? [insight.heroImage.url] : undefined,
  });
}

export function createSchemaGraph(nodes: readonly SchemaNode[]): SchemaNode {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export function JsonLd({ data }: { data: SchemaNode | undefined }): ReactElement | null {
  if (!data) return null;
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export const schemaIds = { organization: organizationId, website: websiteId } as const;
