import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { revalidatePath } from "next/cache";
import type {
  Access,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  Where,
} from "payload";

import { industries } from "@/data/industries";

type CmsUser = { role?: "admin" | "editor" } | null;

export const insightCategories = [
  { label: "Lubricant Basics", value: "lubricant-basics" },
  { label: "Automotive", value: "automotive" },
  { label: "Industrial", value: "industrial" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Product Selection", value: "product-selection" },
  { label: "Technical Guides", value: "technical-guides" },
  { label: "Business & Procurement", value: "business-procurement" },
] as const;

export const resourceTypes = [
  { label: "Technical Data Sheet", value: "technical-data-sheet" },
  { label: "Safety Data Sheet", value: "safety-data-sheet" },
  { label: "Brochure", value: "brochure" },
  { label: "Product Guide", value: "product-guide" },
  { label: "Technical Guide", value: "technical-guide" },
  { label: "Specification Guide", value: "specification-guide" },
  { label: "Catalogue", value: "catalogue" },
  { label: "Other", value: "other" },
] as const;

export const industryOptions = industries.map(({ name, slug }) => ({ label: name, value: slug }));

export const insightEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    OrderedListFeature(),
    UnorderedListFeature(),
    LinkFeature(),
    BlockquoteFeature(),
    UploadFeature({ collections: { media: { fields: [] } } }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
});

const isContentManager = (user: unknown): boolean => {
  const role = (user as CmsUser)?.role;
  return role === "admin" || role === "editor";
};

export const publicPublishedContent: Access = ({ req }) => {
  if (isContentManager(req.user)) return true;
  return {
    and: [
      { publicationStatus: { equals: "published" } },
      {
        or: [
          { technicallySensitive: { equals: false } },
          { verificationStatus: { equals: "verified" } },
        ],
      },
    ],
  } as Where;
};

export const publicVerifiedResources: Access = ({ req }) => {
  if (isContentManager(req.user)) return true;
  return {
    and: [
      { publicationStatus: { equals: "published" } },
      { verificationStatus: { equals: "verified" } },
    ],
  } as Where;
};

export const enforceInsightPublishingGuard: CollectionBeforeChangeHook = ({ data }) => {
  if (
    data.publicationStatus === "published" &&
    data.technicallySensitive === true &&
    data.verificationStatus !== "verified"
  ) {
    throw new Error("Technically sensitive insights must be verified before publication.");
  }
  return data;
};

function relationshipId(value: unknown): string | number | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" || typeof id === "number" ? id : undefined;
  }
  return undefined;
}

export const enforceResourcePublishingGuard: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const publicationStatus = data.publicationStatus ?? originalDoc?.publicationStatus;
  const verificationStatus = data.verificationStatus ?? originalDoc?.verificationStatus;
  if (publicationStatus === "published" && verificationStatus !== "verified") {
    throw new Error("Resources must be verified before publication.");
  }
  if (publicationStatus !== "published") return data;

  const technicalDocumentId = relationshipId(data.technicalDocument ?? originalDoc?.technicalDocument);
  let mediaId = relationshipId(data.file ?? originalDoc?.file);
  if (technicalDocumentId) {
    const document = await req.payload.findByID({ collection: "technical-documents", id: technicalDocumentId, depth: 0, overrideAccess: true, req });
    if (document.publicationStatus !== "published" || document.verificationStatus !== "verified") {
      throw new Error("A published resource requires a published and verified Technical Document.");
    }
    mediaId = relationshipId(document.file);
  }
  if (!mediaId) throw new Error("A published resource requires an approved file source.");
  const media = await req.payload.findByID({ collection: "media", id: mediaId, depth: 0, overrideAccess: true, req });
  if (media.verificationStatus !== "verified") {
    throw new Error("A published resource requires verified Media.");
  }
  return data;
};

export const validateResourceSource: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data;
  const hasTechnicalDocument = Boolean(data.technicalDocument);
  const hasFile = Boolean(data.file);
  if (hasTechnicalDocument === hasFile) {
    throw new Error("Choose exactly one source: an authoritative Technical Document or a Media file.");
  }
  return data;
};

function safelyRevalidate(path: string): void {
  try {
    revalidatePath(path);
  } catch {
    // Payload CLI and migration contexts do not have an active Next.js cache.
  }
}

export const revalidateInsight: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  safelyRevalidate("/insights");
  safelyRevalidate("/resources");
  safelyRevalidate("/sitemap.xml");
  if (typeof doc.slug === "string") safelyRevalidate(`/insights/${doc.slug}`);
  if (typeof previousDoc?.slug === "string" && previousDoc.slug !== doc.slug) {
    safelyRevalidate(`/insights/${previousDoc.slug}`);
  }
  return doc;
};

export const revalidateInsightDelete: CollectionAfterDeleteHook = ({ doc }) => {
  safelyRevalidate("/insights");
  safelyRevalidate("/sitemap.xml");
  if (typeof doc.slug === "string") safelyRevalidate(`/insights/${doc.slug}`);
  return doc;
};

export const revalidateResources: CollectionAfterChangeHook = ({ doc }) => {
  safelyRevalidate("/resources");
  safelyRevalidate("/sitemap.xml");
  return doc;
};

export const revalidateResourcesDelete: CollectionAfterDeleteHook = ({ doc }) => {
  safelyRevalidate("/resources");
  safelyRevalidate("/sitemap.xml");
  return doc;
};
