import {
  commerceAvailabilityStatuses,
  commerceModes,
  currencyCodes,
  inventoryModes,
  priceVisibilities,
  taxClasses,
  type ProductOffer,
} from "../../types/commerce";

import { isValidMinorAmount } from "./money";

export type CommerceValidationIssue = { field: keyof ProductOffer | "sku"; message: string };

export function validateSalePrice(salePriceMinor: unknown, regularPriceMinor: unknown): true | string {
  if (salePriceMinor === undefined || salePriceMinor === null) return true;
  if (!isValidMinorAmount(salePriceMinor)) return "Sale price must be a positive whole number of minor currency units.";
  if (!isValidMinorAmount(regularPriceMinor)) return "Enter a valid regular price before adding a sale price.";
  return salePriceMinor < regularPriceMinor ? true : "Sale price must be lower than the regular price.";
}

export function validateDateRange(start: unknown, end: unknown): true | string {
  if (!start || !end) return true;
  const startTime = Date.parse(String(start));
  const endTime = Date.parse(String(end));
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return "Promotion dates must be valid dates.";
  return endTime >= startTime ? true : "Sale end must be on or after sale start.";
}

export function validateOptionalPositiveInteger(value: unknown): true | string {
  if (value === undefined || value === null) return true;
  return Number.isSafeInteger(value) && Number(value) > 0 ? true : "Use a positive whole number.";
}

export function validateOptionalNonNegativeInteger(value: unknown): true | string {
  if (value === undefined || value === null) return true;
  return Number.isSafeInteger(value) && Number(value) >= 0 ? true : "Use zero or a positive whole number.";
}

export function validateMaximumQuantity(maximum: unknown, minimum: unknown): true | string {
  const valid = validateOptionalPositiveInteger(maximum);
  if (valid !== true || maximum === undefined || maximum === null || minimum === undefined || minimum === null) return valid;
  return Number(maximum) >= Number(minimum) ? true : "Maximum order quantity must be greater than or equal to the minimum.";
}

export function validateStockQuantity(value: unknown, inventoryMode: unknown): true | string {
  if (inventoryMode === "tracked") return validateOptionalNonNegativeInteger(value) === true && value !== undefined && value !== null ? true : "Tracked inventory requires a whole stock quantity of zero or more.";
  return validateOptionalNonNegativeInteger(value);
}

export function validateSkuUniqueness(offers: readonly Pick<ProductOffer, "id" | "sku">[], sku?: string, excludeId?: string): true | string {
  const normalized = sku?.trim().toLocaleUpperCase("en");
  if (!normalized) return true;
  return offers.some((offer) => offer.id !== excludeId && offer.sku?.trim().toLocaleUpperCase("en") === normalized) ? "SKU must be unique." : true;
}

export function validateProductOffer(offer: ProductOffer): CommerceValidationIssue[] {
  const issues: CommerceValidationIssue[] = [];
  if (!commerceModes.includes(offer.commerceMode)) issues.push({ field: "commerceMode", message: "Choose a supported commerce mode." });
  if (!currencyCodes.includes(offer.currency)) issues.push({ field: "currency", message: "Choose a supported currency." });
  if (!priceVisibilities.includes(offer.priceVisibility)) issues.push({ field: "priceVisibility", message: "Choose a supported price visibility." });
  if (!inventoryModes.includes(offer.inventoryMode)) issues.push({ field: "inventoryMode", message: "Choose a supported inventory mode." });
  if (!commerceAvailabilityStatuses.includes(offer.availabilityStatus)) issues.push({ field: "availabilityStatus", message: "Choose a supported availability state." });
  if (!taxClasses.includes(offer.taxClass)) issues.push({ field: "taxClass", message: "Choose a supported tax class." });
  if (offer.regularPriceMinor !== undefined && !isValidMinorAmount(offer.regularPriceMinor)) issues.push({ field: "regularPriceMinor", message: "Regular price must be a positive whole number of minor currency units." });
  const saleResult = validateSalePrice(offer.salePriceMinor, offer.regularPriceMinor);
  if (saleResult !== true) issues.push({ field: "salePriceMinor", message: saleResult });
  const datesResult = validateDateRange(offer.saleStart, offer.saleEnd);
  if (datesResult !== true) issues.push({ field: "saleEnd", message: datesResult });
  const stockResult = validateStockQuantity(offer.stockQuantity, offer.inventoryMode);
  if (stockResult !== true) issues.push({ field: "stockQuantity", message: stockResult });
  const minResult = validateOptionalPositiveInteger(offer.minimumOrderQuantity);
  if (minResult !== true) issues.push({ field: "minimumOrderQuantity", message: minResult });
  const maxResult = validateMaximumQuantity(offer.maximumOrderQuantity, offer.minimumOrderQuantity);
  if (maxResult !== true) issues.push({ field: "maximumOrderQuantity", message: maxResult });
  if ((offer.packSize === undefined) !== (offer.packUnit === undefined)) issues.push({ field: "packSize", message: "Pack size and pack unit must be supplied together." });
  if (offer.publicationStatus === "published" && offer.active && offer.commerceMode !== "quote-only") {
    if (!isValidMinorAmount(offer.regularPriceMinor)) issues.push({ field: "regularPriceMinor", message: "An active published buyable offer requires a regular price." });
    if (!offer.packSize || !offer.packUnit) issues.push({ field: "packSize", message: "An active published buyable offer requires a confirmed pack size and unit." });
    if (offer.marketIds.length === 0) issues.push({ field: "marketIds", message: "An active published buyable offer requires at least one active market." });
  }
  return issues;
}
