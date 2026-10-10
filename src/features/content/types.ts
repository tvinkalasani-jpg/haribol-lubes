export type ContentRelationship = {
  id: string;
  slug: string;
  title: string;
  href: string;
};

export type InsightCategory =
  | "lubricant-basics"
  | "automotive"
  | "industrial"
  | "maintenance"
  | "product-selection"
  | "technical-guides"
  | "business-procurement";

export type InsightRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: Record<string, unknown>;
  byline: string;
  publishedAt?: string;
  updatedAt: string;
  category: InsightCategory;
  tags: readonly string[];
  featured: boolean;
  technicallySensitive: boolean;
  heroImage?: { url: string; alt: string; width?: number; height?: number };
  relatedProducts: readonly ContentRelationship[];
  relatedCategories: readonly ContentRelationship[];
  relatedIndustries: readonly ContentRelationship[];
  relatedApplications: readonly ContentRelationship[];
  relatedResources: readonly ContentRelationship[];
  seo: { metaTitle?: string; metaDescription?: string; canonicalOverride?: string; indexable: boolean };
};

export type ResourceRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  resourceType: string;
  language: string;
  version?: string;
  effectiveDate?: string;
  featured: boolean;
  downloadHref?: string;
};
