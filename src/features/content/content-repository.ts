import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import config from "@payload-config";
import { cmsEnvironment } from "@/cms/environment";
import { industries } from "@/data/industries";

import type { ContentRelationship, InsightRecord, ResourceRecord } from "./types";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | undefined {
  return value && typeof value === "object" ? value as UnknownRecord : undefined;
}

function relation(value: unknown, basePath: string, titleKey = "name"): ContentRelationship | undefined {
  const item = record(value);
  if (!item || typeof item.id !== "number" && typeof item.id !== "string") return undefined;
  const slug = typeof item.slug === "string" ? item.slug : "";
  const title = typeof item[titleKey] === "string" ? item[titleKey] : typeof item.title === "string" ? item.title : "";
  if (!slug || !title) return undefined;
  return { id: String(item.id), slug, title, href: `${basePath}/${slug}` };
}

function relationships(value: unknown, basePath: string, titleKey = "name"): ContentRelationship[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => relation(entry, basePath, titleKey)).filter((entry): entry is ContentRelationship => Boolean(entry));
}

function productRelationships(value: unknown): ContentRelationship[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const item = record(entry);
    const category = record(item?.primaryCategory);
    if (!item || typeof item.id !== "number" && typeof item.id !== "string" || typeof item.slug !== "string" || typeof item.name !== "string" || typeof category?.slug !== "string") return [];
    return [{ id: String(item.id), slug: item.slug, title: item.name, href: `/products/${category.slug}/${item.slug}` }];
  });
}

function applicationRelationships(value: unknown): ContentRelationship[] {
  return relationships(value, "/product-finder", "name").map((entry) => ({ ...entry, href: `/product-finder?application=${encodeURIComponent(entry.slug)}` }));
}

function mapInsight(value: unknown): InsightRecord | undefined {
  const item = record(value);
  if (!item || typeof item.title !== "string" || typeof item.slug !== "string" || typeof item.excerpt !== "string") return undefined;
  const image = record(item.heroImage);
  const seo = record(item.seo);
  const relatedIndustrySlugs = Array.isArray(item.relatedIndustries) ? item.relatedIndustries.filter((entry): entry is string => typeof entry === "string") : [];
  const relatedIndustries = relatedIndustrySlugs.flatMap((slug) => {
    const industry = industries.find((entry) => entry.slug === slug);
    return industry ? [{ id: industry.id, slug, title: industry.name, href: `/industries/${slug}` }] : [];
  });

  return {
    id: String(item.id),
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: record(item.content) ?? {},
    byline: typeof item.byline === "string" ? item.byline : "Haribol Lubes Limited",
    publishedAt: typeof item.publishedAt === "string" ? item.publishedAt : undefined,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : "",
    category: item.category as InsightRecord["category"],
    tags: Array.isArray(item.tags) ? item.tags.flatMap((entry) => typeof record(entry)?.tag === "string" ? [String(record(entry)!.tag)] : []) : [],
    featured: item.featured === true,
    technicallySensitive: item.technicallySensitive === true,
    heroImage: image && typeof image.url === "string" && typeof image.alt === "string" ? { url: image.url, alt: image.alt, width: typeof image.width === "number" ? image.width : undefined, height: typeof image.height === "number" ? image.height : undefined } : undefined,
    relatedProducts: productRelationships(item.relatedProducts),
    relatedCategories: relationships(item.relatedCategories, "/products", "name"),
    relatedIndustries,
    relatedApplications: applicationRelationships(item.relatedApplications),
    relatedResources: relationships(item.relatedResources, "/api/resources", "title").map((entry) => ({ ...entry, href: `/api/resources/${entry.slug}/file` })),
    seo: {
      metaTitle: typeof seo?.metaTitle === "string" ? seo.metaTitle : undefined,
      metaDescription: typeof seo?.metaDescription === "string" ? seo.metaDescription : undefined,
      canonicalOverride: typeof seo?.canonicalOverride === "string" ? seo.canonicalOverride : undefined,
      indexable: seo?.indexable === true,
    },
  };
}

function mapResource(value: unknown): ResourceRecord | undefined {
  const item = record(value);
  if (!item || typeof item.title !== "string" || typeof item.slug !== "string" || typeof item.description !== "string" || typeof item.resourceType !== "string") return undefined;
  return {
    id: String(item.id), title: item.title, slug: item.slug, description: item.description,
    resourceType: item.resourceType, language: typeof item.language === "string" ? item.language : "en",
    version: typeof item.version === "string" ? item.version : undefined,
    effectiveDate: typeof item.effectiveDate === "string" ? item.effectiveDate : undefined,
    featured: item.featured === true, downloadHref: `/api/resources/${item.slug}/file`,
  };
}

async function queryPublicInsights(): Promise<InsightRecord[]> {
  if (!cmsEnvironment.configured) return [];
  const payload = await getPayload({ config });
  const result = await payload.find({ collection: "insights", depth: 2, limit: 100, overrideAccess: false, sort: "-publishedAt" });
  return result.docs.map(mapInsight).filter((entry): entry is InsightRecord => Boolean(entry));
}

async function queryPublicResources(): Promise<ResourceRecord[]> {
  if (!cmsEnvironment.configured) return [];
  const payload = await getPayload({ config });
  const result = await payload.find({ collection: "resources", depth: 2, limit: 100, overrideAccess: false, sort: "-effectiveDate" });
  return result.docs.map(mapResource).filter((entry): entry is ResourceRecord => Boolean(entry));
}

export const getPublicInsights = unstable_cache(queryPublicInsights, ["public-insights"], { revalidate: 3600, tags: ["insights"] });
export const getPublicResources = unstable_cache(queryPublicResources, ["public-resources"], { revalidate: 3600, tags: ["resources"] });

export async function getPublicInsight(slug: string): Promise<InsightRecord | undefined> {
  const insights = await getPublicInsights();
  return insights.find((entry) => entry.slug === slug);
}

export function getRelatedInsights(current: InsightRecord, all: readonly InsightRecord[], limit = 3): InsightRecord[] {
  const currentProducts = new Set(current.relatedProducts.map(({ id }) => id));
  const currentApplications = new Set(current.relatedApplications.map(({ id }) => id));
  const currentIndustries = new Set(current.relatedIndustries.map(({ id }) => id));
  const currentTags = new Set(current.tags.map((tag) => tag.toLocaleLowerCase("en")));
  const score = (candidate: InsightRecord): number =>
    (candidate.category === current.category ? 8 : 0) +
    candidate.relatedProducts.filter(({ id }) => currentProducts.has(id)).length * 5 +
    candidate.relatedApplications.filter(({ id }) => currentApplications.has(id)).length * 3 +
    candidate.relatedIndustries.filter(({ id }) => currentIndustries.has(id)).length * 2 +
    candidate.tags.filter((tag) => currentTags.has(tag.toLocaleLowerCase("en"))).length;

  return all.filter(({ id }) => id !== current.id).map((candidate) => ({ candidate, score: score(candidate) }))
    .sort((a, b) => b.score - a.score || b.candidate.publishedAt?.localeCompare(a.candidate.publishedAt ?? "") || a.candidate.slug.localeCompare(b.candidate.slug))
    .slice(0, limit).map(({ candidate }) => candidate);
}

export function countWordsInLexical(value: Record<string, unknown>): number {
  let text = "";
  const visit = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const item = node as UnknownRecord;
    if (typeof item.text === "string") text += ` ${item.text}`;
    if (Array.isArray(item.children)) item.children.forEach(visit);
  };
  visit(value.root);
  return text.trim() ? text.trim().split(/\s+/u).length : 0;
}

export function getReadingTime(value: Record<string, unknown>): number {
  return Math.max(1, Math.ceil(countWordsInLexical(value) / 220));
}
