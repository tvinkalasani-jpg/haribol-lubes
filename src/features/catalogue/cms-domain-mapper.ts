import type { Brand } from "@/data/brands";
import type { Application, Market, Product, ProductCategory, ProductVariant, Specification, VerificationStatus } from "@/types/product";

type Relationship = string | number | { id: string | number; slug?: string } | null | undefined;
type CmsRecord = Record<string, unknown> & { id: string | number };

function relationId(value: Relationship): string {
  if (value && typeof value === "object") return String(value.slug || value.id);
  return value == null ? "" : String(value);
}

function relationIds(value: unknown): string[] {
  return Array.isArray(value) ? value.map((entry) => relationId(entry as Relationship)).filter(Boolean) : [];
}

function textArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((entry) => typeof entry === "string" ? entry : "").filter(Boolean) : [];
}

function verification(value: unknown): VerificationStatus {
  return ["verified", "catalogue-derived", "needs-review", "unverified", "deprecated"].includes(String(value)) ? value as VerificationStatus : "unverified";
}

export function mapCmsBrand(record: CmsRecord): Brand {
  return {
    id: String(record.slug), slug: String(record.slug), name: String(record.name), shortDescription: String(record.shortDescription || ""),
    status: record.status as Brand["status"], featured: Boolean(record.featured), brandType: record.brandType as Brand["brandType"],
    futureHref: `/brands/${String(record.slug)}`, brandAccent: typeof record.accent === "string" ? record.accent : undefined, notes: typeof record.notes === "string" ? record.notes : undefined,
  };
}

export function mapCmsCategory(record: CmsRecord): ProductCategory {
  return { id: String(record.slug), slug: String(record.slug), name: String(record.name), description: String(record.description || ""), parentCategoryId: relationId(record.parent as Relationship) || undefined, displayOrder: Number(record.displayOrder || 100), cmsId: String(record.id), verificationStatus: verification(record.verificationStatus), seo: { title: typeof (record.seo as Record<string, unknown> | undefined)?.metaTitle === "string" ? String((record.seo as Record<string, unknown>).metaTitle) : undefined, description: typeof (record.seo as Record<string, unknown> | undefined)?.metaDescription === "string" ? String((record.seo as Record<string, unknown>).metaDescription) : undefined, indexable: Boolean((record.seo as Record<string, unknown> | undefined)?.indexable) } };
}

export function mapCmsApplication(record: CmsRecord): Application {
  return { id: String(record.slug), slug: String(record.slug), name: String(record.name), description: String(record.description || ""), displayOrder: Number(record.displayOrder || 100), verificationStatus: verification(record.verificationStatus) };
}

export function mapCmsSpecification(record: CmsRecord): Specification {
  const classification = String(record.classificationType);
  const kind: Specification["kind"] = classification === "oem-approval" ? "oem-approval" : ["gl", "dexron", "to-4", "mt-1"].includes(classification) ? "transmission-classification" : classification === "api-performance" ? "performance-standard" : "technical-classification";
  return { id: String(record.slug), code: String(record.code), name: String(record.name), kind, issuingBody: typeof record.issuingBody === "string" ? record.issuingBody : undefined, isApproval: Boolean(record.isApproval), verificationStatus: verification(record.verificationStatus) };
}

export function mapCmsMarket(record: CmsRecord): Market {
  return { id: String(record.code).toLocaleLowerCase("en"), code: String(record.code), slug: String(record.slug), name: String(record.name), region: String(record.region), status: record.status as Market["status"] };
}

export function mapCmsVariant(record: CmsRecord, productId: string): ProductVariant {
  return { id: String(record.slug), productId, kind: record.kind as ProductVariant["kind"], name: String(record.name), sku: typeof record.sku === "string" ? record.sku : undefined, productCode: typeof record.productCode === "string" ? record.productCode : undefined, viscosityGrade: typeof record.viscosityGrade === "string" && record.viscosityGrade ? { value: record.viscosityGrade, verificationStatus: verification(record.verificationStatus), sourceReference: typeof record.sourceReference === "string" ? record.sourceReference : undefined } : undefined, specificationIds: relationIds(record.specifications), packSize: typeof record.packSize === "number" ? { value: record.packSize, verificationStatus: verification(record.verificationStatus) } : undefined, packUnit: record.packUnit as ProductVariant["packUnit"], containerType: typeof record.containerType === "string" ? record.containerType : undefined, marketIds: relationIds(record.markets).map((value) => value.toLocaleLowerCase("en")), availabilityStatus: record.availabilityStatus as ProductVariant["availabilityStatus"], verificationStatus: verification(record.verificationStatus), sourceReference: typeof record.sourceReference === "string" ? record.sourceReference : undefined };
}

export function mapCmsProduct(record: CmsRecord, variants: readonly CmsRecord[]): Product {
  const id = String(record.slug);
  const seo = (record.seo || {}) as Record<string, unknown>;
  return {
    id, slug: id, name: String(record.name), brandId: relationId(record.brand as Relationship), productFamily: typeof record.productFamily === "string" ? record.productFamily : undefined,
    primaryCategoryId: relationId(record.primaryCategory as Relationship), secondaryCategoryIds: relationIds(record.secondaryCategories), shortDescription: String(record.shortDescription || ""), description: typeof record.description === "string" ? record.description : undefined,
    benefits: Array.isArray(record.benefits) ? record.benefits.map((entry) => String((entry as Record<string, unknown>).text || "")).filter(Boolean) : [], applicationIds: relationIds(record.applications), industryIds: textArray(record.industrySlugs),
    lubricantType: typeof record.lubricantType === "string" && record.lubricantType ? { value: record.lubricantType, verificationStatus: verification(record.verificationStatus), sourceReference: String(record.sourceReference || "") } : undefined,
    baseOilType: typeof record.baseOilType === "string" && record.baseOilType ? { value: record.baseOilType, verificationStatus: verification(record.verificationStatus), sourceReference: String(record.sourceReference || "") } : undefined,
    specificationIds: relationIds(record.specifications), technicalProperties: [], variants: variants.map((variant) => mapCmsVariant(variant, id)), documents: [], images: [], markets: relationIds(record.markets).map((marketId) => ({ marketId: marketId.toLocaleLowerCase("en"), availabilityStatus: "needs-confirmation" as const, verificationStatus: verification(record.verificationStatus) })), relationships: [], searchKeywords: textArray(record.searchKeywords),
    seo: { title: typeof seo.metaTitle === "string" ? seo.metaTitle : undefined, description: typeof seo.metaDescription === "string" ? seo.metaDescription : undefined, canonicalSlug: id, indexable: Boolean(seo.indexable) }, publicationStatus: record.publicationStatus as Product["publicationStatus"], verificationStatus: verification(record.verificationStatus), lastReviewedAt: typeof record.lastReviewedAt === "string" ? record.lastReviewedAt : undefined, sourceReference: String(record.sourceReference || ""),
  };
}

export type CmsCatalogueDocuments = { applications: CmsRecord[]; brands: CmsRecord[]; categories: CmsRecord[]; markets: CmsRecord[]; products: CmsRecord[]; specifications: CmsRecord[]; variants: CmsRecord[] };

export function mapCmsCatalogue(documents: CmsCatalogueDocuments) {
  return {
    applications: documents.applications.map(mapCmsApplication), brands: documents.brands.map(mapCmsBrand), categories: documents.categories.map(mapCmsCategory), markets: documents.markets.map(mapCmsMarket), specifications: documents.specifications.map(mapCmsSpecification),
    products: documents.products.map((product) => mapCmsProduct(product, documents.variants.filter((variant) => relationId(variant.product as Relationship) === String(product.id) || relationId(variant.product as Relationship) === String(product.slug)))),
  };
}
