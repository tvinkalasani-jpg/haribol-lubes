export type VerificationStatus =
  | "verified"
  | "catalogue-derived"
  | "needs-review"
  | "unverified"
  | "deprecated";

export type PublicationStatus = "draft" | "published" | "archived";

export type VerifiedValue<T> = {
  value: T;
  verificationStatus: VerificationStatus;
  sourceReference?: string;
};

export type SeoFields = {
  title?: string;
  description?: string;
  canonicalSlug?: string;
  indexable: boolean;
  openGraphImage?: string;
  keywords?: readonly string[];
};

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  parentCategoryId?: string;
  seo?: SeoFields;
  displayOrder: number;
  cmsId?: string;
  verificationStatus: VerificationStatus;
};

export type Application = {
  id: string;
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
  verificationStatus: VerificationStatus;
};

export type SpecificationKind =
  | "performance-standard"
  | "transmission-classification"
  | "oem-approval"
  | "technical-classification";

export type Specification = {
  id: string;
  code: string;
  name: string;
  kind: SpecificationKind;
  issuingBody?: string;
  isApproval: boolean;
  verificationStatus: VerificationStatus;
  sourceReference?: string;
};

export type TechnicalProperty = {
  id: string;
  propertyName: string;
  testMethod?: string;
  value: string | number;
  unit?: string;
  conditions?: string;
  displayOrder: number;
  verificationStatus: VerificationStatus;
  sourceReference?: string;
};

export type TechnicalDocumentType =
  | "tds"
  | "sds"
  | "certificate"
  | "brochure"
  | "approval"
  | "other";

export type TechnicalDocument = {
  id: string;
  type: TechnicalDocumentType;
  title: string;
  fileUrl: string;
  version?: string;
  language: string;
  marketIds: readonly string[];
  effectiveDate?: string;
  verificationStatus: VerificationStatus;
};

export type ProductImageRole = "hero" | "packshot" | "label" | "technical" | "gallery";

export type ProductImageSource =
  | "supplier-original"
  | "catalogue-extract"
  | "project-generated"
  | "cms";

export type ProductImage = {
  id: string;
  src: string;
  alt: string;
  role: ProductImageRole;
  sortOrder: number;
  sourceType: ProductImageSource;
  verificationStatus: VerificationStatus;
  sourceReference?: string;
  temporary?: boolean;
};

export type MarketStatus = "active" | "planned" | "inactive";

export type Market = {
  id: string;
  code: string;
  slug: string;
  name: string;
  region: string;
  status: MarketStatus;
};

export type AvailabilityStatus =
  | "available"
  | "enquiry-only"
  | "coming-soon"
  | "unavailable"
  | "needs-confirmation";

export type MarketAvailability = {
  marketId: string;
  availabilityStatus: AvailabilityStatus;
  verificationStatus: VerificationStatus;
  notes?: string;
};

export type ProductRelationshipType =
  | "related"
  | "alternative"
  | "recommended-with"
  | "supersedes"
  | "superseded-by";

export type ProductRelationship = {
  productId: string;
  relationshipType: ProductRelationshipType;
  verificationStatus: VerificationStatus;
  notes?: string;
};

export type PackUnit = "ml" | "l" | "kg" | "g" | "unit";

export type ProductVariantKind = "formulation" | "packaging" | "formulation-and-packaging";

export type ProductVariant = {
  id: string;
  productId: string;
  kind: ProductVariantKind;
  name: string;
  sku?: string;
  productCode?: string;
  viscosityGrade?: VerifiedValue<string>;
  specificationIds?: readonly string[];
  packSize?: VerifiedValue<number>;
  packUnit?: PackUnit;
  containerType?: string;
  marketIds: readonly string[];
  availabilityStatus: AvailabilityStatus;
  futureStockReference?: string;
  futurePriceReference?: string;
  verificationStatus: VerificationStatus;
  sourceReference?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  productFamily?: string;
  primaryCategoryId: string;
  secondaryCategoryIds?: readonly string[];
  shortDescription: string;
  description?: string;
  benefits?: readonly string[];
  applicationIds: readonly string[];
  industryIds: readonly string[];
  viscosityGrade?: VerifiedValue<string>;
  lubricantType?: VerifiedValue<string>;
  baseOilType?: VerifiedValue<string>;
  specificationIds: readonly string[];
  technicalProperties: readonly TechnicalProperty[];
  variants: readonly ProductVariant[];
  documents: readonly TechnicalDocument[];
  images: readonly ProductImage[];
  markets: readonly MarketAvailability[];
  relationships: readonly ProductRelationship[];
  searchKeywords: readonly string[];
  seo: SeoFields;
  publicationStatus: PublicationStatus;
  verificationStatus: VerificationStatus;
  lastReviewedAt?: string;
  sourceReference: string;
};

export type ProductSearchDocument = {
  productId: string;
  slug: string;
  name: string;
  brandId: string;
  categoryIds: readonly string[];
  applicationIds: readonly string[];
  industryIds: readonly string[];
  marketIds: readonly string[];
  viscosityGrades: readonly string[];
  specificationIds: readonly string[];
  productCodes: readonly string[];
  keywords: readonly string[];
  searchableText: string;
};

export type RfqProductReference = {
  productId: string;
  variantId?: string;
  quantity: number;
  unit: string;
};
