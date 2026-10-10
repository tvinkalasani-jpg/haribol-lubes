import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { evaluateProductionEnvironment } from "./check-production-readiness.mjs";

const origin = (process.env.LOCAL_SEO_TEST_ORIGIN || "http://localhost:3028").replace(/\/$/, "");
const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");
const fetchPath = async (path) => { const response = await fetch(`${origin}${path}`); return { response, text: await response.text() }; };
const schemas = (html) => [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((entry) => JSON.parse(entry[1] || "{}"));
const nodes = (html) => schemas(html).flatMap((schema) => schema["@graph"] || [schema]);
let passed = 0;
const test = (name, run) => { run(); passed += 1; console.log(`PASS ${String(passed).padStart(2, "0")} ${name}`); };

const [home, about, contact, category, industry, health, admin, robots, sitemap] = await Promise.all([
  fetchPath("/"), fetchPath("/about"), fetchPath("/contact"), fetchPath("/products/engine-oils"), fetchPath("/industries/construction"), fetchPath("/api/health"), fetchPath("/admin"), fetchPath("/robots.txt"), fetchPath("/sitemap.xml"),
]);
const combinedLocalCopy = [home.text, about.text, contact.text].join("\n");
const organization = nodes(home.text).find((node) => node["@type"] === "Organization");
const address = organization?.address;
const businessSource = read("src/config/business.ts");
const siteSource = read("src/config/site.ts");
const routeFiles = read("src/app/sitemap.ts");
const productionEnvironment = {
  DATABASE_URL: "postgresql://least_privilege:secret@db.example/haribol?sslmode=require",
  PAYLOAD_SECRET: "a-unique-production-secret-with-more-than-32-characters",
  NEXT_PUBLIC_SITE_URL: "https://haribollubesltd.co.ke",
  SEO_INDEXING_MODE: "production",
  CATALOGUE_DATA_SOURCE: "cms",
  RFQ_REPOSITORY: "payload",
  NEXT_PUBLIC_WHATSAPP_NUMBER: "+254 794 205 115",
  RFQ_NOTIFICATION_EMAIL: "info@mastermax.co.ke",
  EMAIL_PROVIDER: "resend",
  EMAIL_API_KEY: "configured-secret",
  EMAIL_FROM: "verified-sender@example.com",
  MEDIA_STORAGE_PROVIDER: "railway-s3", S3_ENDPOINT: "https://media.storageapi.dev", S3_ACCESS_KEY_ID: "access", S3_SECRET_ACCESS_KEY: "secret", S3_BUCKET: "public-bucket", S3_REGION: "auto", S3_FORCE_PATH_STYLE: "false", PRIVATE_S3_ENDPOINT: "https://private.storageapi.dev", PRIVATE_S3_ACCESS_KEY_ID: "access", PRIVATE_S3_SECRET_ACCESS_KEY: "secret", PRIVATE_S3_BUCKET: "private-bucket", PRIVATE_S3_REGION: "auto",
  SECURITY_CSP_MODE: "enforce", SECURITY_HSTS_ENABLED: "true", RATE_LIMIT_PROVIDER: "edge", BACKUP_RESTORE_TESTED: "true", LEGAL_REVIEW_STATUS: "approved", CONTACT_ENQUIRY_MODE: "informational", ADMIN_BOOTSTRAP_MODE: "complete",
};

test("Mlolongo appears on homepage", () => assert.match(home.text, /Mlolongo/));
test("Mlolongo appears on About", () => assert.match(about.text, /Mlolongo/));
test("Mlolongo appears on Contact", () => assert.match(contact.text, /Mlolongo/));
test("verified venue consistency", () => assert.equal((combinedLocalCopy.match(/Emerald Business Park/g) || []).length >= 3, true));
test("verified street consistency", () => assert.equal((combinedLocalCopy.match(/Kutch Rd/g) || []).length >= 3, true));
test("no Nairobi physical-location claim", () => assert.doesNotMatch(combinedLocalCopy, /based in Nairobi|operat(?:es|ing) from Nairobi|Nairobi address/i));
test("canonical NAP source exists", () => assert.match(businessSource, /canonicalBusinessRecord/));
test("public phone gap remains explicit", () => assert.match(businessSource, /publicPhone: siteConfig\.phone \|\| null/));
test("public email gap remains explicit", () => assert.match(businessSource, /publicEmail: siteConfig\.publicEmail \|\| null/));
test("verified WhatsApp stays configured", () => assert.match(siteSource, /\+254 794 205 115/));
test("GBP description is factual", () => assert.match(businessSource, /supplies automotive, industrial and specialty lubricants from Mlolongo, Kenya/));
test("GBP description avoids leadership claim", () => assert.doesNotMatch(businessSource, /leading|best|largest|number one/i));
test("Organization remains conservative type", () => assert.equal(organization?.["@type"], "Organization"));
test("schema legal name", () => assert.equal(organization?.legalName, "Haribol Lubes Limited"));
test("schema street", () => assert.equal(address?.streetAddress, "Emerald Business Park, Kutch Rd"));
test("schema locality", () => assert.equal(address?.addressLocality, "Mlolongo"));
test("schema country", () => assert.equal(address?.addressCountry, "KE"));
test("schema has no coordinates", () => assert.equal("geo" in organization, false));
test("schema has no hours", () => assert.equal("openingHours" in organization, false));
test("no city doorway routes", () => assert.equal(routeFiles.includes("nairobi") || routeFiles.includes("mombasa") || routeFiles.includes("kisumu") || routeFiles.includes("nakuru"), false));
test("category and industry intent titles differ", () => { const title = (html) => html.match(/<title>(.*?)<\/title>/)?.[1]; assert.notEqual(title(category.text), title(industry.text)); });
test("category and industry H1s differ", () => { const h1 = (html) => html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, ""); assert.notEqual(h1(category.text), h1(industry.text)); });
test("application registry remains internal", () => assert.match(read("src/app/(website)/applications/page.tsx"), /indexable: false/));
test("specialty thin route remains excluded", () => assert.equal(routeFiles.includes("specialty-fluids"), false));
test("production security nosniff", () => assert.equal(home.response.headers.get("x-content-type-options"), "nosniff"));
test("production referrer policy", () => assert.equal(home.response.headers.get("referrer-policy"), "strict-origin-when-cross-origin"));
test("permissions policy", () => assert.match(home.response.headers.get("permissions-policy") || "", /camera=\(\)/));
test("frame protection", () => assert.equal(home.response.headers.get("x-frame-options"), "SAMEORIGIN"));
test("admin has X-Robots-Tag", () => assert.match(admin.response.headers.get("x-robots-tag") || "", /noindex/));
test("health response is minimal", () => assert.deepEqual(JSON.parse(health.text), { status: "ok" }));
test("health response is not cached", () => assert.match(health.response.headers.get("cache-control") || "", /no-store/));
test("health response is noindex", () => assert.match(health.response.headers.get("x-robots-tag") || "", /noindex/));
test("production robots remains enabled", () => assert.match(robots.text, /Allow: \//));
test("sitemap remains production-origin", () => assert.match(sitemap.text, /https:\/\/haribollubesltd\.co\.ke\//));
test("commerce remains disabled", () => assert.match(siteSource, /commerceEnabled: false/));
test("complete production environment passes", () => assert.equal(evaluateProductionEnvironment(productionEnvironment).ready, true));
test("missing production environment fails closed", () => assert.equal(evaluateProductionEnvironment({}).ready, false));
test("staging indexing mode fails launch check", () => assert.equal(evaluateProductionEnvironment({ ...productionEnvironment, SEO_INDEXING_MODE: "staging" }).ready, false));
test("filesystem RFQ fails launch check", () => assert.equal(evaluateProductionEnvironment({ ...productionEnvironment, RFQ_REPOSITORY: "filesystem" }).ready, false));
test("short Payload secret fails launch check", () => assert.equal(evaluateProductionEnvironment({ ...productionEnvironment, PAYLOAD_SECRET: "short" }).ready, false));

console.log(`\n${passed} local SEO and launch-readiness assertions passed.`);
