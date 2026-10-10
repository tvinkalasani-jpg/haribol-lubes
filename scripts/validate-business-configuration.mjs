import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "+254 794 205 115";
process.env.RFQ_NOTIFICATION_EMAIL = "info@mastermax.co.ke";
execFileSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.business-tests.json"], { stdio: "inherit" });
await writeFile(new URL("../.business-test-build/package.json", import.meta.url), '{"type":"commonjs"}\n');
const require = createRequire(import.meta.url);
const { siteConfig } = require("../.business-test-build/config/site.js");
const { getValidSocialProfiles } = require("../.business-test-build/lib/utils/social-links.js");
const { getRfqNotificationEmail } = require("../.business-test-build/features/enquiries/notification-config.js");

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const tests = [];
const test = (name, run) => tests.push([name, run]);
test("01 RFQ notification recipient", () => assert.equal(getRfqNotificationEmail(), "info@mastermax.co.ke"));
test("02 empty social profiles", () => assert.deepEqual(getValidSocialProfiles(siteConfig.socialLinks), []));
test("03 synthetic social profiles", () => assert.deepEqual(getValidSocialProfiles({ instagram: "https://www.instagram.com/haribol/", facebook: "https://facebook.com/haribol", linkedin: "https://www.linkedin.com/company/haribol", youtube: "https://www.youtube.com/@haribol" }).map((item) => item.network), ["instagram", "facebook", "linkedin", "youtube"]));
test("04 invalid platform homes hidden", () => assert.deepEqual(getValidSocialProfiles({ instagram: "https://instagram.com/", facebook: "https://example.com/haribol", linkedin: "", youtube: "http://youtube.com/@haribol" }), []));
test("05 structured verified address", () => assert.equal(siteConfig.businessAddress.formatted, "Emerald Business Park, Kutch Rd, Mlolongo, Kenya"));
test("06 verified Maps URL", () => assert.match(siteConfig.businessAddress.mapsUrl, /^https:\/\/www\.google\.com\/maps\/place\//));
test("07 Mlolongo configuration", () => assert.equal(siteConfig.city, "Mlolongo"));
test("08 retained Kenya SEO", () => assert.match(siteConfig.defaultSeoTitle + siteConfig.defaultSeoDescription, /Kenya/));
test("09 public email remains empty", () => assert.equal(siteConfig.publicEmail, ""));
test("10 default currency", () => assert.equal(siteConfig.defaultCurrency, "KES"));
test("11 commerce disabled", () => assert.equal(siteConfig.commerceEnabled, false));
test("12 contact address rendering", async () => assert.match(await source("src/components/contact/contact-page.tsx"), /businessAddress\.venue/));
test("13 Get Directions link", async () => assert.match(await source("src/components/contact/contact-page.tsx"), /Get Directions to Haribol Lubes Limited/));
test("14 Specialty pillar", async () => assert.match(await source("src/components/home/business-intro.tsx"), /title: "Specialty"/));
test("15 Supply is not third pillar", async () => assert.doesNotMatch((await source("src/components/home/business-intro.tsx")).split("const pillars")[1].split("] as const")[0], /title: "Supply"/));
test("16 inaccurate map markup absent", async () => { for (const file of ["src/components/home/kenya-presence.tsx", "src/components/contact/contact-page.tsx", "src/app/(website)/about/page.tsx"]) assert.doesNotMatch(await source(file), /kenyaShape|Nairobi marked|fake coordinates|<svg/); });
test("17 footer address", async () => assert.match(await source("src/components/layout/site-footer.tsx"), /businessAddress\.venue/));
test("18 About location", async () => assert.match(await source("src/app/(website)/about/page.tsx"), /Operating from Mlolongo/));
test("19 no public Nairobi claims", async () => { const files = ["src/components/home/business-intro.tsx", "src/components/home/kenya-presence.tsx", "src/components/contact/contact-page.tsx", "src/app/(website)/about/page.tsx", "src/components/layout/site-footer.tsx"]; for (const file of files) assert.doesNotMatch(await source(file), /Nairobi/); });
test("20 no Buy UI", async () => { let listing = ""; try { listing = execFileSync("rg", ["-n", "-i", "buy now|add to cart", "src/components", "src/app"], { encoding: "utf8" }); } catch (error) { if (error.status !== 1) throw error; } assert.equal(listing.trim(), ""); });

let passed = 0;
for (const [name, run] of tests) { try { await run(); console.log(`PASS ${name}`); passed += 1; } catch (error) { console.error(`FAIL ${name}`); throw error; } }
console.log(`Business configuration validation complete: ${passed}/${tests.length} checks passed.`);
