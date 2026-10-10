import {
  rfqBusinessTypes,
  rfqQuantityUnits,
  rfqSources,
  type RfqBusinessType,
  type RfqErrors,
  type RfqInput,
  type RfqQuantityUnit,
  type RfqSource,
} from "../../types/enquiry";

export type RfqValidationContext = {
  products: readonly { id: string; slug: string }[];
  categoryIds: readonly string[];
  industrySlugs: readonly string[];
};

export const rfqLimits = {
  payloadBytes: 32_768,
  name: 100,
  company: 120,
  phone: 40,
  email: 160,
  technical: 160,
  location: 120,
  message: 2_000,
  minimumCompletionMs: 750,
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d\s.\-]{7,40}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeSourcePages = ["/products", "/product-finder", "/industries", "/contact", "/request-a-quote"];

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function booleanValue(value: unknown): boolean {
  return value === true || value === "true" || value === "on";
}

function enumValue<T extends string>(value: unknown, values: readonly T[]): T | "" {
  const candidate = stringValue(value);
  return values.includes(candidate as T) ? (candidate as T) : "";
}

export function normalizeSourcePage(value: unknown): string {
  const path = stringValue(value).split("?")[0] ?? "";
  return safeSourcePages.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
    ? path.slice(0, 240)
    : "/request-a-quote";
}

export function validateRfqPayload(
  raw: unknown,
  context: RfqValidationContext,
  now = Date.now(),
): { success: true; data: RfqInput; productId: string | null } | { success: false; errors: RfqErrors } {
  const value = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const businessCandidate = stringValue(value.businessType);
  const unitCandidate = stringValue(value.quantityUnit);
  const sourceCandidate = stringValue(value.source);
  const quantityText = stringValue(value.quantity);
  const quantity = quantityText === "" ? null : Number(quantityText);
  const productSlug = stringValue(value.productSlug);
  const product = context.products.find((entry) => entry.slug === productSlug);
  const categoryId = stringValue(value.categoryId);
  const industrySlug = stringValue(value.industrySlug);
  const errors: RfqErrors = {};

  const data: RfqInput = {
    name: stringValue(value.name), company: stringValue(value.company), phone: stringValue(value.phone),
    email: stringValue(value.email).toLowerCase(),
    businessType: enumValue(value.businessType, rfqBusinessTypes) as RfqBusinessType | "",
    productSlug, categoryId, unsure: booleanValue(value.unsure),
    gradeOrViscosity: stringValue(value.gradeOrViscosity), specification: stringValue(value.specification),
    application: stringValue(value.application), quantity: Number.isFinite(quantity) ? quantity : null,
    quantityUnit: enumValue(value.quantityUnit, rfqQuantityUnits) as RfqQuantityUnit | "",
    location: stringValue(value.location), message: stringValue(value.message), consent: booleanValue(value.consent),
    source: (rfqSources.includes(sourceCandidate as RfqSource) ? sourceCandidate : "direct") as RfqSource,
    sourcePage: normalizeSourcePage(value.sourcePage), industrySlug,
    idempotencyKey: stringValue(value.idempotencyKey), formStartedAt: Number(value.formStartedAt),
    website: stringValue(value.website),
  };

  if (!data.name) errors.name = "Enter your full name.";
  else if (data.name.length > rfqLimits.name) errors.name = `Use ${rfqLimits.name} characters or fewer.`;
  if (data.company.length > rfqLimits.company) errors.company = `Use ${rfqLimits.company} characters or fewer.`;
  if (!data.phone && !data.email) errors.contactMethod = "Enter a phone number or email address.";
  if (data.phone && !phonePattern.test(data.phone)) errors.phone = "Enter a usable phone number.";
  if (data.email && (!emailPattern.test(data.email) || data.email.length > rfqLimits.email)) errors.email = "Enter a valid email address.";
  if (businessCandidate && !data.businessType) errors.businessType = "Choose a listed business type.";
  if (productSlug && !product) errors.productSlug = "Choose a product from the current catalogue.";
  if (categoryId && !context.categoryIds.includes(categoryId)) errors.categoryId = "Choose a listed product category.";
  if (!productSlug && !categoryId && !data.unsure) errors.productRequirement = "Choose a product or category, or select ‘I’m not sure’.";
  if (data.gradeOrViscosity.length > rfqLimits.technical) errors.gradeOrViscosity = "Use 160 characters or fewer.";
  if (data.specification.length > rfqLimits.technical) errors.specification = "Use 160 characters or fewer.";
  if (data.application.length > rfqLimits.technical) errors.application = "Use 160 characters or fewer.";
  if (quantityText && (!Number.isFinite(quantity) || Number(quantity) <= 0 || Number(quantity) > 1_000_000_000)) errors.quantity = "Enter a quantity greater than zero.";
  if (quantityText && !data.quantityUnit) errors.quantityUnit = "Choose a unit for the quantity.";
  if (unitCandidate && !data.quantityUnit) errors.quantityUnit = "Choose a listed quantity unit.";
  if (!data.location) errors.location = "Enter a town or delivery location.";
  else if (data.location.length > rfqLimits.location) errors.location = "Use 120 characters or fewer.";
  if (data.message.length > rfqLimits.message) errors.message = "Use 2,000 characters or fewer.";
  if (!data.consent) errors.consent = "Confirm that Haribol may use these details to respond.";
  if (sourceCandidate && !rfqSources.includes(sourceCandidate as RfqSource)) errors.source = "The enquiry source is invalid.";
  if (industrySlug && !context.industrySlugs.includes(industrySlug)) errors.industrySlug = "The industry context is invalid.";
  if (!uuidPattern.test(data.idempotencyKey)) errors.idempotencyKey = "Refresh the page and try again.";
  if (!Number.isFinite(data.formStartedAt) || data.formStartedAt <= 0 || now - data.formStartedAt < rfqLimits.minimumCompletionMs) errors.formStartedAt = "Please review the form and try again.";
  if (data.website) errors.website = "The submission could not be accepted.";

  return Object.keys(errors).length > 0 ? { success: false, errors } : { success: true, data, productId: product?.id ?? null };
}
