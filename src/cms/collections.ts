import path from "node:path";

import type { CollectionConfig, Field } from "payload";

import {
  validateDateRange,
  validateMaximumQuantity,
  validateOptionalNonNegativeInteger,
  validateOptionalPositiveInteger,
  validateSalePrice,
  validateStockQuantity,
} from "@/lib/commerce/validation";
import {
  commerceAvailabilityStatuses,
  commerceModes,
  containerTypes,
  currencyCodes,
  inventoryModes,
  packUnits,
  priceVisibilities,
  promotionLabels,
  taxClasses,
  taxTreatments,
} from "@/types/commerce";
import { orderStatuses, paymentProviders, paymentStatuses } from "@/types/checkout";

import { adminsOnly, adminsOnlyField, contentManagers, noPublicAccess } from "./access";
import { validateOrderStatusTransition, validatePaymentStatusTransition } from "./commerce-hooks";
import {
  enforceInsightPublishingGuard,
  enforceResourcePublishingGuard,
  industryOptions,
  insightCategories,
  insightEditor,
  publicPublishedContent,
  publicVerifiedResources,
  resourceTypes,
  revalidateInsight,
  revalidateInsightDelete,
  revalidateResources,
  revalidateResourcesDelete,
  validateResourceSource,
} from "./content";
import { publicationStatusField, seoFields, slugField, verificationStatusField } from "./fields";

const contentAccess = { create: contentManagers, delete: contentManagers, read: contentManagers, update: contentManagers };
const versions = { maxPerDoc: 50 } as const;

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    lockTime: 10 * 60 * 1000,
    maxLoginAttempts: 5,
    tokenExpiration: 8 * 60 * 60,
  },
  admin: { group: "Administration", useAsTitle: "email" },
  access: { create: adminsOnly, delete: adminsOnly, read: adminsOnly, update: adminsOnly },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "select", required: true, defaultValue: "editor", options: [{ label: "Administrator", value: "admin" }, { label: "Editor", value: "editor" }], access: { update: adminsOnlyField } },
  ],
};

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "application/pdf"],
  },
  admin: { group: "Assets", useAsTitle: "filename" },
  access: contentAccess,
  fields: [
    { name: "alt", label: "Alternative text", type: "text", required: true },
    { name: "caption", type: "text" },
    { name: "sourceType", label: "Source type", type: "select", required: true, defaultValue: "cms", options: ["supplier-original", "catalogue-extract", "project-generated", "cms"] },
    verificationStatusField,
  ],
};

export const Brands: CollectionConfig = {
  slug: "brands",
  admin: { group: "Catalogue", useAsTitle: "name", defaultColumns: ["name", "status", "verificationStatus"] },
  access: contentAccess,
  versions,
  fields: [
    { type: "tabs", tabs: [
      { label: "Basic Information", fields: [{ name: "name", type: "text", required: true }, slugField, { name: "shortDescription", type: "textarea", required: true }, { name: "status", type: "select", required: true, options: ["active", "provisional", "inactive"] }, { name: "featured", type: "checkbox", defaultValue: false }, { name: "brandType", label: "Brand type", type: "select", required: true, options: ["owned", "partner", "distributed", "unverified"] }, { name: "logo", type: "relationship", relationTo: "media" }, { name: "accent", label: "Brand accent", type: "text" }, { name: "notes", type: "textarea" }] },
      { label: "Publication & Verification", fields: [verificationStatusField] },
    ] },
  ],
};

export const ProductCategories: CollectionConfig = {
  slug: "product-categories",
  labels: { singular: "Product Category", plural: "Product Categories" },
  admin: { group: "Catalogue", useAsTitle: "name", defaultColumns: ["name", "slug", "publicationStatus"] },
  access: contentAccess,
  versions,
  fields: [
    { name: "name", type: "text", required: true }, slugField, { name: "description", type: "textarea", required: true },
    { name: "parent", type: "relationship", relationTo: "product-categories", admin: { description: "Optional parent category. Existing canonical category slugs must be preserved." } },
    { name: "displayOrder", label: "Display order", type: "number", required: true, defaultValue: 100 }, seoFields, publicationStatusField, verificationStatusField,
  ],
};

export const Applications: CollectionConfig = {
  slug: "applications",
  admin: { group: "Catalogue", useAsTitle: "name" }, access: contentAccess, versions,
  fields: [{ name: "name", type: "text", required: true }, slugField, { name: "description", type: "textarea", required: true }, { name: "displayOrder", label: "Display order", type: "number", required: true, defaultValue: 100 }, verificationStatusField],
};

export const Specifications: CollectionConfig = {
  slug: "specifications",
  admin: { group: "Catalogue", useAsTitle: "code" }, access: contentAccess, versions,
  fields: [
    { name: "name", type: "text", required: true }, { name: "code", type: "text", required: true, unique: true, index: true }, slugField,
    { name: "classificationType", label: "Classification type", type: "select", required: true, options: [
      { label: "Viscosity / grade", value: "viscosity-grade" }, { label: "API performance", value: "api-performance" }, { label: "GL classification", value: "gl" }, { label: "Dexron classification", value: "dexron" }, { label: "TO-4 classification", value: "to-4" }, { label: "MT-1 classification", value: "mt-1" }, { label: "OEM approval", value: "oem-approval" }, { label: "Other technical classification", value: "technical-classification" },
    ], admin: { description: "Classifications are not manufacturer approvals unless formally documented as such." } },
    { name: "description", type: "textarea" }, { name: "issuingBody", label: "Issuing body", type: "text" }, { name: "isApproval", label: "Documented approval", type: "checkbox", defaultValue: false, admin: { description: "Only enable for formally documented manufacturer approvals." } }, verificationStatusField,
  ],
};

export const Markets: CollectionConfig = {
  slug: "markets", admin: { group: "Catalogue", useAsTitle: "name" }, access: contentAccess, versions,
  fields: [{ name: "name", type: "text", required: true }, { name: "code", type: "text", required: true, unique: true, maxLength: 3 }, slugField, { name: "region", type: "text", required: true, defaultValue: "East Africa" }, { name: "status", type: "select", required: true, options: ["active", "planned", "inactive"] }],
};

export const Products: CollectionConfig = {
  slug: "products",
  admin: { group: "Catalogue", useAsTitle: "name", defaultColumns: ["name", "primaryCategory", "publicationStatus", "verificationStatus"] },
  access: contentAccess,
  versions,
  fields: [{ type: "tabs", tabs: [
    { label: "Basic Information", fields: [{ name: "name", type: "text", required: true }, slugField, { name: "brand", type: "relationship", relationTo: "brands", required: true }, { name: "primaryCategory", label: "Primary category", type: "relationship", relationTo: "product-categories", required: true }, { name: "secondaryCategories", label: "Secondary categories", type: "relationship", relationTo: "product-categories", hasMany: true }, { name: "productFamily", label: "Product family", type: "text" }, { name: "shortDescription", type: "textarea", required: true }, { name: "description", type: "textarea" }, { name: "benefits", type: "array", fields: [{ name: "text", type: "text", required: true }] }] },
    { label: "Classification", fields: [{ name: "lubricantType", label: "Lubricant type", type: "text" }, { name: "baseOilType", label: "Base oil type", type: "text" }, { name: "applications", type: "relationship", relationTo: "applications", hasMany: true }, { name: "industrySlugs", label: "Industry slugs", type: "text", hasMany: true, admin: { description: "Industries remain code-managed during this transition." } }, { name: "specifications", type: "relationship", relationTo: "specifications", hasMany: true }, { name: "markets", type: "relationship", relationTo: "markets", hasMany: true }] },
    { label: "Technical Details", fields: [{ name: "technicalProperties", dbName: "tech_props", label: "Technical properties", type: "array", fields: [{ name: "propertyName", label: "Property", type: "text", required: true }, { name: "value", type: "text", required: true }, { name: "unit", type: "text" }, { name: "testMethod", label: "Test method", type: "text" }, { name: "conditions", type: "text" }, verificationStatusField] }, { name: "sourceReference", label: "Source reference", type: "text", required: true }, { name: "lastReviewedAt", label: "Last reviewed", type: "date" }] },
    { label: "Documents", fields: [{ name: "documents", type: "relationship", relationTo: "technical-documents", hasMany: true }] },
    { label: "Media", fields: [{ name: "images", type: "array", fields: [{ name: "image", type: "relationship", relationTo: "media", required: true }, { name: "role", type: "select", required: true, options: ["hero", "packshot", "label", "technical", "gallery"] }, { name: "displayOrder", label: "Display order", type: "number", defaultValue: 100 }] }] },
    { label: "SEO", fields: [seoFields, { name: "searchKeywords", label: "Internal search keywords", type: "text", hasMany: true }] },
    { label: "Publication & Verification", fields: [publicationStatusField, verificationStatusField] },
  ] }],
};

export const ProductVariants: CollectionConfig = {
  slug: "product-variants", labels: { singular: "Product Variant", plural: "Product Variants" },
  admin: { group: "Catalogue", useAsTitle: "name", defaultColumns: ["name", "product", "availabilityStatus", "verificationStatus"] }, access: contentAccess, versions,
  fields: [
    { name: "name", type: "text", required: true }, slugField, { name: "product", type: "relationship", relationTo: "products", required: true, index: true },
    { name: "kind", type: "select", required: true, options: ["formulation", "packaging", "formulation-and-packaging"] }, { name: "sku", label: "SKU", type: "text", unique: true }, { name: "productCode", label: "Product code", type: "text" }, { name: "viscosityGrade", label: "Viscosity / grade", type: "text" }, { name: "specifications", type: "relationship", relationTo: "specifications", hasMany: true },
    { name: "packSize", label: "Pack size", type: "number" }, { name: "packUnit", label: "Pack unit", type: "select", options: ["ml", "l", "kg", "g", "unit"] }, { name: "containerType", label: "Container type", type: "text" }, { name: "markets", type: "relationship", relationTo: "markets", hasMany: true },
    { name: "availabilityStatus", label: "Availability status", type: "select", required: true, defaultValue: "needs-confirmation", options: ["available", "enquiry-only", "coming-soon", "unavailable", "needs-confirmation"], admin: { description: "Do not claim availability until confirmed by Haribol." } }, { name: "sourceReference", label: "Source reference", type: "text" }, verificationStatusField,
  ],
};

export const ProductOffers: CollectionConfig = {
  slug: "product-offers",
  labels: { singular: "Product Offer", plural: "Product Offers" },
  admin: {
    group: "Commerce",
    useAsTitle: "displayName",
    defaultColumns: ["displayName", "product", "commerceMode", "currency", "regularPriceMinor", "availabilityStatus", "publicationStatus"],
    description: "Admin-only sellable packs, pricing and inventory. Public commerce remains disabled until approved.",
  },
  access: { create: adminsOnly, delete: adminsOnly, read: adminsOnly, update: adminsOnly },
  versions: { maxPerDoc: 100 },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Offer",
          fields: [
            { name: "displayName", label: "Display name", type: "text", required: true, admin: { description: "Business-friendly pack name, for example a verified product and pack description." } },
            { name: "product", type: "relationship", relationTo: "products", required: true, index: true },
            { name: "variant", label: "Formulation variant", type: "relationship", relationTo: "product-variants", index: true, admin: { description: "Optional link to a technical formulation variant." } },
            { name: "sku", label: "Commercial SKU", type: "text", unique: true, index: true, admin: { description: "Optional. Must be a real business SKU; database IDs are not SKUs." } },
            { name: "barcode", label: "EAN / UPC / GTIN", type: "text", validate: (value: unknown) => !value || /^\d{8,14}$/.test(String(value)) ? true : "Use a verified 8–14 digit EAN, UPC or GTIN." },
            { name: "sortOrder", label: "Sort order", type: "number", required: true, defaultValue: 100, validate: validateOptionalNonNegativeInteger },
          ],
        },
        {
          label: "Packaging",
          fields: [
            { name: "packSize", label: "Pack quantity", type: "number", min: 0.001, admin: { description: "Numeric quantity only. A 200 L drum is quantity 200 with unit L and container drum." } },
            { name: "packUnit", label: "Pack unit", type: "select", options: packUnits.map((value) => ({ label: value === "l" ? "L" : value, value })) },
            { name: "containerType", label: "Container type", type: "select", options: containerTypes.map((value) => ({ label: value[0]!.toUpperCase() + value.slice(1), value })) },
          ],
        },
        {
          label: "Commerce",
          fields: [
            { name: "commerceMode", label: "Commerce mode", type: "select", required: true, defaultValue: "quote-only", options: commerceModes.map((value) => ({ label: value.replaceAll("-", " "), value })), admin: { description: "Quote only is the conservative default. Buy online and Both require approved commerce data before publication." } },
            { name: "active", label: "Commerce active", type: "checkbox", required: true, defaultValue: false, admin: { description: "This does not override the site-level commerceEnabled=false safety flag." } },
            { name: "priceVisibility", label: "Price visibility", type: "select", required: true, defaultValue: "quote-only", options: priceVisibilities.map((value) => ({ label: value.replaceAll("-", " "), value })) },
          ],
        },
        {
          label: "Pricing",
          fields: [
            { name: "currency", type: "select", required: true, defaultValue: "KES", options: currencyCodes.map((value) => ({ label: value, value })), admin: { description: "Stored with the offer. No automatic currency conversion is performed." } },
            { name: "regularPriceMinor", label: "Regular price (minor units)", type: "number", min: 1, admin: { description: "Whole minor units only. KES 1,250.00 is stored as 125000." }, validate: (value: unknown) => value === undefined || value === null || (Number.isSafeInteger(value) && Number(value) > 0) ? true : "Regular price must be a positive whole number of minor currency units." },
            { name: "salePriceMinor", label: "Sale price (minor units)", type: "number", min: 1, admin: { description: "Optional. Must be lower than the regular price; discount percentage is calculated." }, validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => validateSalePrice(value, siblingData.regularPriceMinor) },
          ],
        },
        {
          label: "Promotion",
          fields: [
            { name: "promotionLabel", label: "Promotion label", type: "select", options: promotionLabels.map((value) => ({ label: value.replaceAll("-", " "), value })) },
            { name: "saleStart", label: "Sale start", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
            { name: "saleEnd", label: "Sale end", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } }, validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => validateDateRange(siblingData.saleStart, value) },
          ],
        },
        {
          label: "Inventory",
          fields: [
            { name: "inventoryMode", label: "Inventory mode", type: "select", required: true, defaultValue: "on-enquiry", options: inventoryModes.map((value) => ({ label: value.replaceAll("-", " "), value })) },
            { name: "stockQuantity", label: "Stock quantity", type: "number", min: 0, validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => validateStockQuantity(value, siblingData.inventoryMode), admin: { description: "Required only for tracked inventory. On-enquiry quantities are never treated as live stock." } },
            { name: "lowStockThreshold", label: "Low-stock threshold", type: "number", min: 0, validate: validateOptionalNonNegativeInteger },
            { name: "availabilityStatus", label: "Availability status", type: "select", required: true, defaultValue: "available-on-enquiry", options: commerceAvailabilityStatuses.map((value) => ({ label: value.replaceAll("-", " "), value })) },
            { name: "minimumOrderQuantity", label: "Minimum order quantity", type: "number", min: 1, validate: validateOptionalPositiveInteger },
            { name: "maximumOrderQuantity", label: "Maximum order quantity", type: "number", min: 1, validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => validateMaximumQuantity(value, siblingData.minimumOrderQuantity) },
          ],
        },
        {
          label: "Market & Tax",
          fields: [
            { name: "markets", type: "relationship", relationTo: "markets", hasMany: true, filterOptions: { status: { equals: "active" } }, admin: { description: "Only active markets can be assigned. Kenya is currently the only active commerce market." } },
            { name: "taxClass", label: "Tax class", type: "select", required: true, defaultValue: "unknown", options: taxClasses.map((value) => ({ label: value.replaceAll("-", " "), value })) },
            { name: "taxTreatment", label: "Price tax treatment", type: "select", required: true, defaultValue: "unknown", options: taxTreatments.map((value) => ({ label: value, value })), admin: { description: "Leave unknown until Kenyan accounting treatment is verified. No VAT rate is configured here." } },
          ],
        },
        {
          label: "Publication & Verification",
          fields: [publicationStatusField, verificationStatusField],
        },
      ],
    },
  ],
};

export const TechnicalDocuments: CollectionConfig = {
  slug: "technical-documents", labels: { singular: "Technical Document", plural: "Technical Documents" },
  admin: { group: "Assets", useAsTitle: "title" }, access: { ...contentAccess, read: publicVerifiedResources }, versions,
  hooks: { afterChange: [revalidateResources], afterDelete: [revalidateResourcesDelete] },
  fields: [{ name: "title", type: "text", required: true }, slugField, { name: "documentType", label: "Document type", type: "select", required: true, options: [{ label: "TDS", value: "tds" }, { label: "SDS", value: "sds" }, { label: "Certificate", value: "certificate" }, { label: "Brochure", value: "brochure" }, { label: "Approval", value: "approval" }, { label: "Other", value: "other" }] }, { name: "file", type: "relationship", relationTo: "media", required: true }, { name: "version", type: "text" }, { name: "language", type: "text", required: true, defaultValue: "en" }, { name: "effectiveDate", label: "Effective date", type: "date" }, { name: "markets", type: "relationship", relationTo: "markets", hasMany: true }, { name: "products", type: "relationship", relationTo: "products", hasMany: true }, publicationStatusField, verificationStatusField],
};

export const Resources: CollectionConfig = {
  slug: "resources",
  labels: { singular: "Resource", plural: "Resources" },
  admin: { group: "Content", useAsTitle: "title", defaultColumns: ["title", "resourceType", "publicationStatus", "verificationStatus"] },
  access: { create: contentManagers, delete: contentManagers, read: publicVerifiedResources, update: contentManagers },
  versions,
  hooks: {
    beforeValidate: [validateResourceSource],
    beforeChange: [enforceResourcePublishingGuard],
    afterChange: [revalidateResources],
    afterDelete: [revalidateResourcesDelete],
  },
  fields: [
    { type: "tabs", tabs: [
      { label: "Resource", fields: [
        { name: "title", type: "text", required: true }, slugField,
        { name: "description", type: "textarea", required: true },
        { name: "resourceType", label: "Resource type", type: "select", required: true, options: [...resourceTypes] },
        { name: "technicalDocument", label: "Technical Document", type: "relationship", relationTo: "technical-documents", admin: { description: "Use for authoritative TDS, SDS and other controlled technical files." } },
        { name: "file", type: "relationship", relationTo: "media", admin: { description: "Use only for a non-technical resource. Choose this or Technical Document, never both." } },
        { name: "thumbnail", type: "relationship", relationTo: "media" },
        { name: "featured", type: "checkbox", defaultValue: false },
      ] },
      { label: "Relationships", fields: [
        { name: "relatedProducts", label: "Related products", type: "relationship", relationTo: "products", hasMany: true },
        { name: "relatedCategories", label: "Related categories", type: "relationship", relationTo: "product-categories", hasMany: true },
        { name: "relatedBrands", label: "Related brands", type: "relationship", relationTo: "brands", hasMany: true },
        { name: "markets", type: "relationship", relationTo: "markets", hasMany: true },
      ] },
      { label: "Document metadata", fields: [
        { name: "language", type: "text", required: true, defaultValue: "en" },
        { name: "version", type: "text" },
        { name: "effectiveDate", label: "Effective date", type: "date" },
      ] },
      { label: "SEO", fields: [seoFields] },
      { label: "Publication & Verification", fields: [publicationStatusField, verificationStatusField] },
    ] },
  ],
};

export const Insights: CollectionConfig = {
  slug: "insights",
  labels: { singular: "Insight", plural: "Insights" },
  admin: { group: "Content", useAsTitle: "title", defaultColumns: ["title", "category", "publicationStatus", "verificationStatus", "updatedAt"] },
  access: { create: contentManagers, delete: contentManagers, read: publicPublishedContent, update: contentManagers },
  versions,
  hooks: {
    beforeChange: [enforceInsightPublishingGuard],
    afterChange: [revalidateInsight],
    afterDelete: [revalidateInsightDelete],
  },
  fields: [
    { type: "tabs", tabs: [
      { label: "Article", fields: [
        { name: "title", type: "text", required: true }, slugField,
        { name: "excerpt", type: "textarea", required: true, maxLength: 280 },
        { name: "heroImage", label: "Hero image", type: "relationship", relationTo: "media" },
        { name: "content", type: "richText", required: true, editor: insightEditor, admin: { description: "Begin article sections at H2. H1 is supplied by the page template. Raw HTML and embeds are disabled." } },
        { name: "byline", type: "text", required: true, defaultValue: "Haribol Lubes Limited", admin: { description: "Use the company byline unless a real, approved contributor is supplied." } },
        { name: "publishedAt", label: "Publication date", type: "date", admin: { date: { pickerAppearance: "dayOnly" } } },
        { name: "category", type: "select", required: true, options: [...insightCategories] },
        { name: "tags", type: "array", maxRows: 12, fields: [{ name: "tag", type: "text", required: true }] },
        { name: "featured", type: "checkbox", defaultValue: false },
      ] },
      { label: "Relationships", fields: [
        { name: "relatedProducts", label: "Related products", type: "relationship", relationTo: "products", hasMany: true },
        { name: "relatedCategories", label: "Related categories", type: "relationship", relationTo: "product-categories", hasMany: true },
        { name: "relatedIndustries", label: "Related industries", type: "select", hasMany: true, options: industryOptions, admin: { description: "Industries remain code-managed in the current architecture." } },
        { name: "relatedApplications", label: "Related applications", type: "relationship", relationTo: "applications", hasMany: true },
        { name: "relatedResources", label: "Related resources", type: "relationship", relationTo: "resources", hasMany: true },
      ] },
      { label: "SEO", fields: [seoFields] },
      { label: "Publication & Verification", fields: [
        { name: "technicallySensitive", label: "Technically sensitive", type: "checkbox", defaultValue: true, admin: { description: "When enabled, the article must be verified before it can be published." } },
        { ...publicationStatusField, admin: { description: "Controls whether the article is visible publicly." } } as Field,
        { ...verificationStatusField, admin: { description: "Indicates whether technical statements have been reviewed." } } as Field,
      ] },
    ] },
  ],
};

export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  admin: { group: "Sales", useAsTitle: "referenceNumber", defaultColumns: ["referenceNumber", "status", "createdAt", "notificationStatus"] },
  access: { create: noPublicAccess, delete: adminsOnly, read: adminsOnly, update: adminsOnly },
  fields: [
    { name: "referenceNumber", label: "Reference number", type: "text", required: true, unique: true, index: true }, { name: "idempotencyKey", label: "Idempotency key", type: "text", required: true, unique: true, index: true, admin: { hidden: true } }, { name: "status", type: "select", required: true, options: ["received", "reviewing", "contacted", "quoted", "closed"] },
    { name: "name", type: "text", required: true }, { name: "company", type: "text" }, { name: "phone", type: "text" }, { name: "email", type: "email" }, { name: "businessType", label: "Business type", type: "text" }, { name: "source", type: "text", required: true }, { name: "sourcePage", label: "Source page", type: "text", required: true },
    { name: "product", type: "relationship", relationTo: "products" }, { name: "productIdSnapshot", label: "Product ID snapshot", type: "text" }, { name: "productSlugSnapshot", label: "Product slug snapshot", type: "text" }, { name: "categorySnapshot", label: "Category snapshot", type: "text" }, { name: "gradeOrViscosity", label: "Grade / viscosity", type: "text" }, { name: "specification", type: "text" }, { name: "application", type: "text" },
    { name: "quantity", type: "number" }, { name: "quantityUnit", label: "Quantity unit", type: "text" }, { name: "location", type: "text", required: true }, { name: "message", type: "textarea" }, { name: "consentRecordedAt", label: "Consent recorded at", type: "date", required: true },
    { name: "notificationStatus", label: "Notification status", type: "select", required: true, options: ["pending", "sent", "failed", "unavailable"] }, { name: "notificationAttempts", label: "Notification attempts", type: "number", required: true, defaultValue: 0 }, { name: "metadata", type: "json", admin: { description: "Server-generated operational metadata only. Never expose publicly." } },
  ],
};

const immutableFinancialField = { update: () => false } as const;
const nonNegativeMinorAmount = (value: unknown): true | string =>
  Number.isSafeInteger(value) && Number(value) >= 0 ? true : "Use a non-negative whole number of minor currency units.";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    group: "Commerce",
    useAsTitle: "referenceNumber",
    defaultColumns: ["referenceNumber", "status", "paymentStatus", "customerName", "grandTotalMinor", "createdAt"],
    description: "Private guest-checkout order records. Financial snapshots are immutable after creation.",
  },
  access: { create: adminsOnly, delete: adminsOnly, read: adminsOnly, update: adminsOnly },
  hooks: { beforeChange: [validateOrderStatusTransition] },
  versions: { maxPerDoc: 100 },
  fields: [
    { type: "tabs", tabs: [
      { label: "Order", fields: [
        { name: "referenceNumber", label: "Order reference", type: "text", required: true, unique: true, index: true, access: immutableFinancialField },
        { name: "idempotencyKey", label: "Checkout idempotency key", type: "text", required: true, unique: true, index: true, admin: { hidden: true }, access: immutableFinancialField },
        { name: "source", type: "select", required: true, defaultValue: "website-checkout", options: [{ label: "Website checkout", value: "website-checkout" }, { label: "Admin created", value: "admin" }], access: immutableFinancialField },
      ] },
      { label: "Customer", fields: [
        { name: "customerName", label: "Full name", type: "text", required: true },
        { name: "company", type: "text" },
        { name: "phone", type: "text", required: true },
        { name: "email", type: "email" },
      ] },
      { label: "Delivery", fields: [
        { name: "deliveryLocation", label: "Delivery town / location", type: "text", required: true },
        { name: "deliveryInstructions", label: "Delivery instructions", type: "textarea" },
        { name: "deliveryMethod", label: "Delivery method", type: "select", required: true, defaultValue: "unconfigured", options: [
          { label: "Not configured", value: "unconfigured" }, { label: "Delivery", value: "delivery" }, { label: "Pickup — future approval required", value: "pickup" },
        ], admin: { description: "No public shipping or pickup promise is active." } },
      ] },
      { label: "Lines", fields: [
        { name: "lines", type: "array", required: true, minRows: 1, access: immutableFinancialField, fields: [
          { name: "offer", type: "relationship", relationTo: "product-offers" },
          { name: "product", type: "relationship", relationTo: "products" },
          { name: "offerIdSnapshot", label: "Offer ID snapshot", type: "text", required: true },
          { name: "productIdSnapshot", label: "Product ID snapshot", type: "text", required: true },
          { name: "productNameSnapshot", label: "Product name", type: "text", required: true },
          { name: "variantNameSnapshot", label: "Variant", type: "text" },
          { name: "offerNameSnapshot", label: "Offer / pack name", type: "text", required: true },
          { name: "skuSnapshot", label: "SKU", type: "text" },
          { name: "packSizeSnapshot", label: "Pack size", type: "number" },
          { name: "packUnitSnapshot", label: "Pack unit", type: "select", options: packUnits.map((value) => ({ label: value === "l" ? "L" : value, value })) },
          { name: "containerSnapshot", label: "Container", type: "select", options: containerTypes.map((value) => ({ label: value, value })) },
          { name: "quantity", type: "number", required: true, min: 1, validate: validateOptionalPositiveInteger },
          { name: "currency", type: "select", required: true, options: currencyCodes.map((value) => ({ label: value, value })) },
          { name: "regularUnitPriceMinor", label: "Regular unit price", type: "number", required: true, validate: nonNegativeMinorAmount },
          { name: "unitPriceMinor", label: "Charged unit price", type: "number", required: true, validate: nonNegativeMinorAmount },
          { name: "unitDiscountMinor", label: "Unit discount", type: "number", required: true, validate: nonNegativeMinorAmount },
          { name: "taxClassSnapshot", label: "Tax class", type: "select", required: true, options: taxClasses.map((value) => ({ label: value, value })) },
          { name: "taxTreatmentSnapshot", label: "Tax treatment", type: "select", required: true, options: taxTreatments.map((value) => ({ label: value, value })) },
          { name: "lineSubtotalMinor", label: "Line subtotal", type: "number", required: true, validate: nonNegativeMinorAmount },
          { name: "lineDiscountMinor", label: "Line discount", type: "number", required: true, validate: nonNegativeMinorAmount },
          { name: "lineTaxMinor", label: "Line tax", type: "number", required: true, validate: nonNegativeMinorAmount },
          { name: "lineTotalMinor", label: "Line total", type: "number", required: true, validate: nonNegativeMinorAmount },
        ] },
      ] },
      { label: "Totals", fields: [
        { name: "currency", type: "select", required: true, options: currencyCodes.map((value) => ({ label: value, value })), access: immutableFinancialField },
        { name: "subtotalMinor", label: "Subtotal", type: "number", required: true, validate: nonNegativeMinorAmount, access: immutableFinancialField },
        { name: "discountTotalMinor", label: "Discount total", type: "number", required: true, validate: nonNegativeMinorAmount, access: immutableFinancialField },
        { name: "taxTotalMinor", label: "Tax total", type: "number", required: true, validate: nonNegativeMinorAmount, access: immutableFinancialField, admin: { description: "Remains zero until verified tax configuration exists." } },
        { name: "deliveryTotalMinor", label: "Delivery total", type: "number", required: true, validate: nonNegativeMinorAmount, access: immutableFinancialField, admin: { description: "No public delivery pricing is configured." } },
        { name: "grandTotalMinor", label: "Grand total", type: "number", required: true, validate: nonNegativeMinorAmount, access: immutableFinancialField },
      ] },
      { label: "Payment & Status", fields: [
        { name: "status", label: "Order status", type: "select", required: true, defaultValue: "pending-payment", options: orderStatuses.map((value) => ({ label: value.replaceAll("-", " "), value })) },
        { name: "paymentStatus", label: "Payment status", type: "select", required: true, defaultValue: "unpaid", options: paymentStatuses.map((value) => ({ label: value.replaceAll("-", " "), value })) },
        { name: "paymentProvider", label: "Payment provider", type: "select", options: paymentProviders.map((value) => ({ label: value, value })) },
        { name: "paymentReference", label: "Payment reference", type: "text" },
      ] },
      { label: "Internal", fields: [
        { name: "internalNotes", label: "Internal notes", type: "textarea" },
        { name: "metadata", type: "json", admin: { description: "Server-generated operational metadata only. Do not store provider secrets." } },
      ] },
    ] },
  ],
};

export const PaymentTransactions: CollectionConfig = {
  slug: "payment-transactions",
  labels: { singular: "Payment Transaction", plural: "Payment Transactions" },
  admin: {
    group: "Commerce",
    useAsTitle: "providerReference",
    defaultColumns: ["order", "provider", "providerReference", "amountMinor", "currency", "status", "createdAt"],
    description: "Private provider-neutral payment records. No payment provider is integrated yet.",
  },
  access: { create: adminsOnly, delete: adminsOnly, read: adminsOnly, update: adminsOnly },
  hooks: { beforeChange: [validatePaymentStatusTransition] },
  versions: { maxPerDoc: 100 },
  fields: [
    { name: "order", type: "relationship", relationTo: "orders", required: true, index: true, access: immutableFinancialField },
    { name: "provider", type: "select", required: true, options: paymentProviders.map((value) => ({ label: value, value })), access: immutableFinancialField },
    { name: "providerReference", label: "Provider reference", type: "text", unique: true, index: true, admin: { description: "Optional until a provider assigns a verified reference." } },
    { name: "amountMinor", label: "Amount (minor units)", type: "number", required: true, validate: nonNegativeMinorAmount, access: immutableFinancialField, admin: { description: "Must be copied from the immutable order grand total by the server." } },
    { name: "currency", type: "select", required: true, options: currencyCodes.map((value) => ({ label: value, value })), access: immutableFinancialField },
    { name: "status", type: "select", required: true, defaultValue: "unpaid", options: paymentStatuses.map((value) => ({ label: value.replaceAll("-", " "), value })) },
    { name: "rawEventReference", label: "Raw event reference", type: "text", index: true, admin: { description: "Reference only. Never store provider secrets or unfiltered sensitive payloads." } },
    { name: "failureCode", label: "Failure code", type: "text" },
    { name: "failureMessage", label: "Safe internal failure message", type: "textarea" },
  ],
};

export const collections: CollectionConfig[] = [Users, Media, Brands, ProductCategories, Applications, Specifications, Markets, Products, ProductVariants, ProductOffers, TechnicalDocuments, Resources, Insights, Enquiries, Orders, PaymentTransactions];
