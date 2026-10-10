import { pathToFileURL } from "node:url";

const productionOrigin = "https://haribollubesltd.co.ke";

export function evaluateStagingEnvironment(environment) {
  const blockers = [];
  const warnings = [];
  const required = (key, message) => {
    if (!environment[key]?.trim()) blockers.push({ key, message });
  };

  for (const [key, message] of [
    ["STAGING_URL", "Configure the HTTPS staging hostname."],
    ["DATABASE_URL", "Configure a dedicated managed staging PostgreSQL URL."],
    ["PAYLOAD_SECRET", "Configure a unique staging Payload secret."],
    ["R2_ACCOUNT_ID", "Configure staging R2 access."],
    ["R2_ACCESS_KEY_ID", "Configure the staging R2 access key."],
    ["R2_SECRET_ACCESS_KEY", "Configure the staging R2 secret key."],
    ["R2_BUCKET", "Configure the staging public-media bucket."],
    ["R2_PRIVATE_BUCKET", "Configure the staging private-document bucket."],
    ["R2_ENDPOINT", "Configure the R2 S3 endpoint."],
    ["R2_PUBLIC_URL", "Configure the staging public-media origin."],
    ["EMAIL_API_KEY", "Configure the Postmark staging server token."],
    ["EMAIL_FROM", "Configure a verified sender identity."],
    ["RFQ_NOTIFICATION_EMAIL", "Configure the approved RFQ recipient."],
    ["STAGING_ACCESS_USERNAME", "Configure staging HTTP authentication."],
    ["STAGING_ACCESS_PASSWORD", "Configure a strong staging access password."],
    ["READINESS_TOKEN", "Configure the protected readiness token."],
  ]) required(key, message);

  let stagingUrl;
  try { stagingUrl = new URL(environment.STAGING_URL); } catch { blockers.push({ key: "STAGING_URL", message: "STAGING_URL must be an absolute URL." }); }
  if (stagingUrl?.protocol !== "https:") blockers.push({ key: "STAGING_URL", message: "Staging must use HTTPS." });
  if (stagingUrl?.origin === productionOrigin) blockers.push({ key: "STAGING_URL", message: "Staging must not use the production hostname." });
  if (environment.NEXT_PUBLIC_SITE_URL !== stagingUrl?.origin) blockers.push({ key: "NEXT_PUBLIC_SITE_URL", message: "Use the exact staging runtime origin; canonical metadata remains pinned to the production domain in siteConfig." });
  if (environment.DEPLOYMENT_ENVIRONMENT !== "staging") blockers.push({ key: "DEPLOYMENT_ENVIRONMENT", message: "Set staging explicitly so access protection fails closed." });
  if (environment.SEO_INDEXING_MODE === "production") blockers.push({ key: "SEO_INDEXING_MODE", message: "Staging must remain non-production for search indexing." });
  if (!/^postgres(?:ql)?:\/\//.test(environment.DATABASE_URL || "") || /(?:localhost|127\.0\.0\.1)/i.test(environment.DATABASE_URL || "")) blockers.push({ key: "DATABASE_URL", message: "Use managed PostgreSQL, never the local development cluster." });
  if (!/[?&]sslmode=(?:require|verify-ca|verify-full)(?:&|$)/i.test(environment.DATABASE_URL || "")) blockers.push({ key: "DATABASE_URL", message: "Require PostgreSQL TLS in the staging connection string." });
  if ((environment.PAYLOAD_SECRET || "").length < 32) blockers.push({ key: "PAYLOAD_SECRET", message: "PAYLOAD_SECRET must contain at least 32 characters." });
  if ((environment.STAGING_ACCESS_PASSWORD || "").length < 16) blockers.push({ key: "STAGING_ACCESS_PASSWORD", message: "Use a staging access password of at least 16 characters." });
  if ((environment.READINESS_TOKEN || "").length < 32) blockers.push({ key: "READINESS_TOKEN", message: "READINESS_TOKEN must contain at least 32 characters." });
  if (environment.CATALOGUE_DATA_SOURCE !== "cms") blockers.push({ key: "CATALOGUE_DATA_SOURCE", message: "Staging must exercise the migrated CMS catalogue." });
  if (environment.RFQ_REPOSITORY !== "payload") blockers.push({ key: "RFQ_REPOSITORY", message: "Staging RFQs must persist to PostgreSQL." });
  if (environment.MEDIA_STORAGE_PROVIDER !== "r2") blockers.push({ key: "MEDIA_STORAGE_PROVIDER", message: "Staging uploads must use R2." });
  if (environment.EMAIL_PROVIDER !== "postmark") blockers.push({ key: "EMAIL_PROVIDER", message: "Phase 30 selects one provider: Postmark." });
  if (environment.SECURITY_CSP_MODE !== "enforce") blockers.push({ key: "SECURITY_CSP_MODE", message: "Staging must exercise the enforcing CSP." });
  if (environment.STAGING_BACKUPS_ENABLED !== "true") blockers.push({ key: "STAGING_BACKUPS_ENABLED", message: "Enable provider backups before staging validation." });
  if (environment.R2_BUCKET && environment.R2_BUCKET === environment.R2_PRIVATE_BUCKET) blockers.push({ key: "R2_PRIVATE_BUCKET", message: "Public and private files require separate staging buckets." });
  if (environment.PAYLOAD_SEED_ADMIN_PASSWORD?.trim()) blockers.push({ key: "PAYLOAD_SEED_ADMIN_PASSWORD", message: "Remove temporary bootstrap credentials after creating the administrator." });
  if (environment.ADMIN_BOOTSTRAP_MODE !== "complete") blockers.push({ key: "ADMIN_BOOTSTRAP_MODE", message: "Complete and remove the one-time admin bootstrap before exposing staging." });
  if (environment.NEXT_PUBLIC_ANALYTICS_ENABLED === "true") blockers.push({ key: "NEXT_PUBLIC_ANALYTICS_ENABLED", message: "Analytics remains disabled in Phase 30." });
  if (environment.STOREFRONT_TEST_MODE === "true") blockers.push({ key: "STOREFRONT_TEST_MODE", message: "Commerce test mode must remain disabled." });
  if (environment.BACKUP_RESTORE_TESTED !== "true") warnings.push({ key: "BACKUP_RESTORE_TESTED", message: "Backups may be enabled, but restore readiness remains unverified until a restore drill succeeds." });
  if (!environment.SENTRY_DSN?.trim()) warnings.push({ key: "SENTRY_DSN", message: "Sentry is intentionally deferred because no credentials were supplied." });

  return { configurationReady: blockers.length === 0, liveVerificationRequired: true, blockers, warnings };
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedPath) {
  const result = evaluateStagingEnvironment(process.env);
  console.log(JSON.stringify(result, null, 2));
  if (!result.configurationReady && !process.argv.includes("--allow-incomplete")) process.exitCode = 1;
}
