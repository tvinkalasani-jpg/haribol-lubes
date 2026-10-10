const developmentSecret = "development-placeholder-not-a-production-secret";

export const cmsEnvironment = {
  configured: Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET && process.env.PAYLOAD_SECRET.length >= 32),
  databaseUrl: process.env.DATABASE_URL || "",
  secret: process.env.PAYLOAD_SECRET || developmentSecret,
} as const;

export function assertCmsEnvironment(): void {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required when CMS or Payload persistence is enabled.");
  if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32) {
    throw new Error("PAYLOAD_SECRET must be configured with at least 32 characters when CMS or Payload persistence is enabled.");
  }
}

export type CatalogueDataSource = "static" | "cms";

export function getCatalogueDataSource(): CatalogueDataSource {
  const value = process.env.CATALOGUE_DATA_SOURCE || "static";
  if (value !== "static" && value !== "cms") throw new Error("CATALOGUE_DATA_SOURCE must be either 'static' or 'cms'.");
  if (value === "cms") assertCmsEnvironment();
  return value;
}

