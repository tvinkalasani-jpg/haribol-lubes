import { siteConfig } from "@/config/site";

/** Canonical business identity for listings, schema, and launch QA. */
export const canonicalBusinessRecord = {
  name: siteConfig.companyName,
  shortName: siteConfig.shortName,
  address: {
    venue: siteConfig.businessAddress.venue,
    street: siteConfig.businessAddress.street,
    locality: siteConfig.businessAddress.locality,
    country: siteConfig.businessAddress.country,
    countryCode: "KE",
    formatted: siteConfig.businessAddress.formatted,
  },
  publicPhone: siteConfig.phone || null,
  whatsapp: siteConfig.whatsapp,
  publicEmail: siteConfig.publicEmail || null,
  businessHours: siteConfig.businessHours || null,
  website: siteConfig.domain,
  mapsUrl: siteConfig.businessAddress.mapsUrl,
} as const;

export const businessListingDescription =
  "Haribol Lubes Limited supplies automotive, industrial and specialty lubricants from Mlolongo, Kenya, including the Mastermax lubricant range.";
