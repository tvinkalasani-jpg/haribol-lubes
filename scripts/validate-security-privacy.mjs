import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { evaluateProductionEnvironment } from "./check-production-readiness.mjs";

const origin = (process.env.SECURITY_TEST_ORIGIN || "http://localhost:3029").replace(/\/$/, "");
const source = (path) => readFileSync(resolve(process.cwd(), path), "utf8");
const request = (path, options) => fetch(`${origin}${path}`, { redirect: "manual", ...options });
let passed = 0;
const test = async (name, check) => {
  await check();
  passed += 1;
  console.log(`PASS ${String(passed).padStart(2, "0")} ${name}`);
};

const [home, admin, api, resource, privacy, terms] = await Promise.all([
  request("/"), request("/admin"), request("/api/health"), request("/api/resources/not-published/file"), request("/privacy"), request("/terms"),
]);
const csp = home.headers.get("content-security-policy") || "";
const rfqRoute = source("src/app/api/enquiries/rfq/route.ts");
const collections = source("src/cms/collections.ts");
const analytics = source("src/lib/analytics/index.ts");
const payloadConfig = source("payload.config.ts");
const theme = source("src/lib/theme.ts");
const cart = source("src/lib/checkout/cart.ts");
const whatsapp = source("src/lib/utils/whatsapp.ts");
const nextConfig = source("next.config.ts");
const stagingProxy = source("src/proxy.ts");
const envExample = source(".env.example");

await test("homepage uses enforcing CSP", () => assert.ok(csp));
await test("CSP default source is self", () => assert.match(csp, /default-src 'self'/));
await test("CSP objects are disabled", () => assert.match(csp, /object-src 'none'/));
await test("CSP base URI is restricted", () => assert.match(csp, /base-uri 'self'/));
await test("CSP forms are same-origin", () => assert.match(csp, /form-action 'self'/));
await test("CSP framing is restricted", () => assert.match(csp, /frame-ancestors 'self'/));
await test("CSP does not contain wildcard sources", () => assert.doesNotMatch(csp, /(?:^|\s)\*(?:\s|;|$)/));
await test("CSP does not use unsafe eval", () => assert.doesNotMatch(csp, /unsafe-eval/));
await test("nosniff is set", () => assert.equal(home.headers.get("x-content-type-options"), "nosniff"));
await test("referrer policy is set", () => assert.equal(home.headers.get("referrer-policy"), "strict-origin-when-cross-origin"));
await test("permissions policy disables sensitive features", () => assert.match(home.headers.get("permissions-policy") || "", /camera=\(\).*payment=\(\)/));
await test("frame compatibility header is set", () => assert.equal(home.headers.get("x-frame-options"), "SAMEORIGIN"));
await test("COOP is same origin", () => assert.equal(home.headers.get("cross-origin-opener-policy"), "same-origin"));
await test("CORP is same origin", () => assert.equal(home.headers.get("cross-origin-resource-policy"), "same-origin"));
await test("HSTS is absent on local HTTP", () => assert.equal(home.headers.get("strict-transport-security"), null));
await test("admin receives CSP", () => assert.ok(admin.headers.get("content-security-policy")));
await test("admin remains noindex", () => assert.match(admin.headers.get("x-robots-tag") || "", /noindex/));
await test("API remains noindex", () => assert.match(api.headers.get("x-robots-tag") || "", /noindex/));
await test("resource route receives security headers", () => assert.equal(resource.headers.get("x-content-type-options"), "nosniff"));
await test("resource route does not expose unpublished file", () => assert.equal(resource.status, 404));
await test("health response remains minimal", async () => assert.deepEqual(await api.json(), { status: "ok" }));
await test("health response is not cached", () => assert.match(api.headers.get("cache-control") || "", /no-store/));
await test("CORS is not broadly enabled", () => assert.equal(api.headers.get("access-control-allow-origin"), null));

const wrongType = await request("/api/enquiries/rfq", { method: "POST", headers: { "content-type": "text/plain" }, body: "{}" });
await test("RFQ rejects wrong content type", () => assert.equal(wrongType.status, 415));
const crossOrigin = await request("/api/enquiries/rfq", { method: "POST", headers: { "content-type": "application/json", origin: "https://attacker.invalid" }, body: "{}" });
await test("RFQ rejects cross-origin mutation", () => assert.equal(crossOrigin.status, 403));
const malformed = await request("/api/enquiries/rfq", { method: "POST", headers: { "content-type": "application/json", origin }, body: "{" });
await test("RFQ rejects malformed JSON", () => assert.equal(malformed.status, 400));
const oversized = await request("/api/enquiries/rfq", { method: "POST", headers: { "content-type": "application/json", origin }, body: "x".repeat(32_769) });
await test("RFQ rejects declared oversized payload", () => assert.equal(oversized.status, 413));
const missing = await request("/api/enquiries/rfq", { method: "POST", headers: { "content-type": "application/json", origin }, body: "{}" });
await test("RFQ rejects missing required fields", () => assert.equal(missing.status, 400));
const honeypot = await request("/api/enquiries/rfq", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify({ website: "spam.example" }) });
await test("RFQ honeypot remains active", async () => assert.ok((await honeypot.json()).errors.website));
const wrongMethod = await request("/api/enquiries/rfq", { method: "PUT", headers: { "content-type": "application/json" }, body: "{}" });
await test("RFQ rejects unsupported methods", () => assert.equal(wrongMethod.status, 405));
await test("RFQ mutations are not cached", () => assert.match(wrongType.headers.get("cache-control") || "", /no-store/));
await test("RFQ route uses explicit request security", () => assert.match(rfqRoute, /validateJsonMutationRequest/));
await test("RFQ route never logs request bodies", () => assert.doesNotMatch(rfqRoute, /console\.(?:log|info|error).*raw|console\.(?:log|info|error).*request/i));

await test("admin login attempts are bounded", () => assert.match(collections, /maxLoginAttempts:\s*5/));
await test("admin lockout is configured", () => assert.match(collections, /lockTime:\s*10 \* 60 \* 1000/));
await test("admin session duration is bounded", () => assert.match(collections, /tokenExpiration:\s*8 \* 60 \* 60/));
await test("staging Basic Auth is not forwarded into Payload", () => assert.match(stagingProxy, /requestHeaders\.delete\("authorization"\)/));
await test("zero-admin production startup fails closed", () => assert.match(payloadConfig, /users\.totalDocs === 0[\s\S]*ADMIN_BOOTSTRAP_MODE !== "allow-local"/));
await test("user collection is admin-only", () => assert.match(collections, /slug: "users"[\s\S]*?access: \{ create: adminsOnly, delete: adminsOnly, read: adminsOnly, update: adminsOnly \}/));
await test("enquiries are private", () => assert.match(collections, /slug: "enquiries"[\s\S]*?access: \{ create: noPublicAccess, delete: adminsOnly, read: adminsOnly, update: adminsOnly \}/));
await test("orders are private", () => assert.match(collections, /slug: "orders"[\s\S]*?access: \{ create: adminsOnly, delete: adminsOnly, read: adminsOnly, update: adminsOnly \}/));
await test("payments are private", () => assert.match(collections, /slug: "payment-transactions"[\s\S]*?access: \{ create: adminsOnly, delete: adminsOnly, read: adminsOnly, update: adminsOnly \}/));
await test("uploaded SVG is disallowed", () => assert.doesNotMatch(collections, /image\/svg\+xml|image\/\*/));
await test("approved raster and PDF types are explicit", () => assert.match(collections, /image\/jpeg[\s\S]*image\/png[\s\S]*image\/webp[\s\S]*application\/pdf/));

await test("privacy draft describes actual RFQ data", async () => assert.match(await privacy.text(), /Quotation requests may include/));
await test("privacy draft discloses analytics state", async () => assert.match(await (await request("/privacy")).text(), /Marketing analytics is not currently installed/));
await test("terms draft explains RFQ status", async () => assert.match(await terms.text(), /quotation request is an enquiry/));
await test("theme storage contains no PII fields", () => assert.doesNotMatch(theme, /email|phone|company|address|message/i));
await test("cart persistence contains identifiers and quantity only", () => assert.match(cart, /offerId[\s\S]*quantity/));
await test("analytics rejects sensitive property fragments", () => assert.match(analytics, /address.*company.*email.*message.*name.*order_reference.*phone.*rfq_reference/s));
await test("analytics is consent gated", () => assert.match(analytics, /!consentGranted \|\| !adapter/));
await test("analytics adapter is no-op by default", () => assert.match(analytics, /let adapter: AnalyticsAdapter \| undefined/));
await test("WhatsApp builder uses controlled contexts", () => assert.doesNotMatch(whatsapp, /email|customerName|company|address/));
await test("CSP is produced by centralized security module", () => assert.match(nextConfig, /securityHeaders\(\)/));
await test("environment example contains no secret values", () => assert.doesNotMatch(envExample, /(?:API_KEY|SECRET_ACCESS_KEY|PAYLOAD_SECRET)=\S+/));

const complete = {
  DATABASE_URL: "postgresql://app:secret@db.example/haribol?sslmode=require", PAYLOAD_SECRET: "a-unique-production-secret-with-more-than-32-characters",
  NEXT_PUBLIC_SITE_URL: "https://haribollubesltd.co.ke", SEO_INDEXING_MODE: "production", CATALOGUE_DATA_SOURCE: "cms", RFQ_REPOSITORY: "payload",
  NEXT_PUBLIC_WHATSAPP_NUMBER: "+254 794 205 115", RFQ_NOTIFICATION_EMAIL: "info@mastermax.co.ke", EMAIL_PROVIDER: "resend", EMAIL_API_KEY: "secret", EMAIL_FROM: "website@example.com",
  MEDIA_STORAGE_PROVIDER: "railway-s3", S3_ENDPOINT: "https://media.storageapi.dev", S3_ACCESS_KEY_ID: "access", S3_SECRET_ACCESS_KEY: "secret", S3_BUCKET: "public", S3_REGION: "auto", S3_FORCE_PATH_STYLE: "false",
  PRIVATE_S3_ENDPOINT: "https://private.storageapi.dev", PRIVATE_S3_ACCESS_KEY_ID: "access", PRIVATE_S3_SECRET_ACCESS_KEY: "secret", PRIVATE_S3_BUCKET: "private", PRIVATE_S3_REGION: "auto",
  SECURITY_CSP_MODE: "enforce", SECURITY_HSTS_ENABLED: "true", RATE_LIMIT_PROVIDER: "edge", BACKUP_RESTORE_TESTED: "true", LEGAL_REVIEW_STATUS: "approved", CONTACT_ENQUIRY_MODE: "informational", ADMIN_BOOTSTRAP_MODE: "complete",
};
await test("complete catalogue launch configuration passes", () => assert.equal(evaluateProductionEnvironment(complete).ready, true));
await test("analytics without consent mode fails closed", () => assert.equal(evaluateProductionEnvironment({ ...complete, NEXT_PUBLIC_ANALYTICS_ENABLED: "true" }).ready, false));
await test("storefront test mode fails closed", () => assert.equal(evaluateProductionEnvironment({ ...complete, STOREFRONT_TEST_MODE: "true" }).ready, false));
await test("runtime seed password fails closed", () => assert.equal(evaluateProductionEnvironment({ ...complete, PAYLOAD_SEED_ADMIN_PASSWORD: "must-not-remain" }).ready, false));
await test("in-memory production limiter fails closed", () => assert.equal(evaluateProductionEnvironment({ ...complete, RATE_LIMIT_PROVIDER: "memory" }).ready, false));
await test("commerce credentials are not required", () => assert.equal(evaluateProductionEnvironment(complete).blockers.some(({ key }) => /PAYMENT|MPESA|COMMERCE/.test(key)), false));

console.log(`\nSecurity and privacy validation complete: ${passed} checks passed.`);
