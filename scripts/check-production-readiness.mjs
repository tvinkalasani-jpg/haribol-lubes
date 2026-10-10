import { pathToFileURL } from "node:url";

const productionOrigin = "https://haribollubesltd.co.ke";

export function evaluateProductionEnvironment(environment) {
  const blockers = [];
  const warnings = [];
  const required = (key, message) => {
    if (!environment[key]?.trim()) blockers.push({ key, message });
  };

  required("DATABASE_URL", "Configure the managed PostgreSQL connection string.");
  required("PAYLOAD_SECRET", "Configure a unique Payload secret of at least 32 characters.");
  required("EMAIL_PROVIDER", "Choose and configure the production email provider.");
  required("EMAIL_API_KEY", "Configure the email-provider credential.");
  required("EMAIL_FROM", "Verify and configure a sender identity; it must not be inferred from the recipient.");
  required("RFQ_NOTIFICATION_EMAIL", "Configure the approved RFQ destination inbox.");
  required("S3_ENDPOINT", "Configure Railway Object Storage for production media.");
  required("S3_ACCESS_KEY_ID", "Configure the production media access key.");
  required("S3_SECRET_ACCESS_KEY", "Configure the production media secret.");
  required("S3_BUCKET", "Configure the production media bucket.");
  required("S3_REGION", "Configure the production media region.");
  required("PRIVATE_S3_ENDPOINT", "Configure the private production object-storage endpoint.");
  required("PRIVATE_S3_ACCESS_KEY_ID", "Configure the private-document access key.");
  required("PRIVATE_S3_SECRET_ACCESS_KEY", "Configure the private-document secret.");
  required("PRIVATE_S3_BUCKET", "Configure a separate private bucket for unpublished and restricted files.");
  required("PRIVATE_S3_REGION", "Configure the private-document region.");

  if (environment.NEXT_PUBLIC_SITE_URL !== productionOrigin) blockers.push({ key: "NEXT_PUBLIC_SITE_URL", message: `Set the exact canonical origin: ${productionOrigin}.` });
  if (environment.SEO_INDEXING_MODE !== "production") blockers.push({ key: "SEO_INDEXING_MODE", message: "Set production only after the final noindex review is approved." });
  if (environment.CATALOGUE_DATA_SOURCE !== "cms") blockers.push({ key: "CATALOGUE_DATA_SOURCE", message: "Use the migrated production CMS catalogue source." });
  if (environment.RFQ_REPOSITORY !== "payload") blockers.push({ key: "RFQ_REPOSITORY", message: "Production RFQs must use the database repository." });
  if (environment.MEDIA_STORAGE_PROVIDER !== "railway-s3") blockers.push({ key: "MEDIA_STORAGE_PROVIDER", message: "Production Payload media must use Railway Object Storage through the approved S3-compatible adapter." });
  if (environment.EMAIL_PROVIDER !== "resend") blockers.push({ key: "EMAIL_PROVIDER", message: "Production transactional email must use the approved Resend provider." });
  if (!/^(edge|redis|database)$/.test(environment.RATE_LIMIT_PROVIDER || "")) blockers.push({ key: "RATE_LIMIT_PROVIDER", message: "Configure and verify a shared production rate limiter." });
  if (environment.SECURITY_CSP_MODE !== "enforce") blockers.push({ key: "SECURITY_CSP_MODE", message: "Use the tested enforcing CSP for production." });
  if (environment.SECURITY_HSTS_ENABLED !== "true") blockers.push({ key: "SECURITY_HSTS_ENABLED", message: "Enable the conservative HSTS rollout only after HTTPS is verified." });
  if (environment.BACKUP_RESTORE_TESTED !== "true") blockers.push({ key: "BACKUP_RESTORE_TESTED", message: "Complete and record a production backup restore test." });
  if (environment.LEGAL_REVIEW_STATUS !== "approved") blockers.push({ key: "LEGAL_REVIEW_STATUS", message: "Obtain business/legal approval for privacy and terms content." });
  if (!/^(informational|backend)$/.test(environment.CONTACT_ENQUIRY_MODE || "")) blockers.push({ key: "CONTACT_ENQUIRY_MODE", message: "Declare whether the Contact form is informational or backed by persistence." });
  if (environment.ADMIN_BOOTSTRAP_MODE !== "complete") blockers.push({ key: "ADMIN_BOOTSTRAP_MODE", message: "Create and verify the first administrator before exposing production Admin." });
  if (!/^postgres(?:ql)?:\/\//.test(environment.DATABASE_URL || "")) blockers.push({ key: "DATABASE_URL", message: "DATABASE_URL must use PostgreSQL." });
  if ((environment.PAYLOAD_SECRET || "").length < 32) blockers.push({ key: "PAYLOAD_SECRET", message: "PAYLOAD_SECRET must contain at least 32 characters." });
  if (!environment.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()) blockers.push({ key: "NEXT_PUBLIC_WHATSAPP_NUMBER", message: "Retain the verified WhatsApp number." });
  if (environment.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" && environment.ANALYTICS_CONSENT_MODE !== "opt-in") blockers.push({ key: "ANALYTICS_CONSENT_MODE", message: "Analytics cannot load without the approved consent mode." });
  if (environment.STOREFRONT_TEST_MODE === "true") blockers.push({ key: "STOREFRONT_TEST_MODE", message: "Storefront test mode must be disabled in production." });
  if (environment.PAYLOAD_SEED_ADMIN_PASSWORD?.trim()) blockers.push({ key: "PAYLOAD_SEED_ADMIN_PASSWORD", message: "Do not retain bootstrap administrator credentials in the production runtime." });
  if (!environment.SENTRY_DSN?.trim()) warnings.push({ key: "SENTRY_DSN", message: "Runtime monitoring is deferred and should be configured in a later phase." });
  if (!environment.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()) warnings.push({ key: "NEXT_PUBLIC_GA_MEASUREMENT_ID", message: "Analytics remains intentionally unconfigured." });
  if (environment.CONTACT_ENQUIRY_MODE === "informational") warnings.push({ key: "CONTACT_ENQUIRY_MODE", message: "The Contact form validates locally but does not submit; keep its user-facing disclosure visible." });

  return { ready: blockers.length === 0, blockers, warnings };
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedPath) {
  const result = evaluateProductionEnvironment(process.env);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ready && !process.argv.includes("--allow-incomplete")) process.exitCode = 1;
}
