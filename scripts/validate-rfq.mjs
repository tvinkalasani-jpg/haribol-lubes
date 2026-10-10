import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

execFileSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.rfq-tests.json"], { stdio: "inherit" });
await writeFile(new URL("../.rfq-test-build/package.json", import.meta.url), '{"type":"commonjs"}\n');
const require = createRequire(import.meta.url);
const { validateRfqPayload, rfqLimits } = require("../.rfq-test-build/lib/validation/rfq.js");
const { RfqService } = require("../.rfq-test-build/features/enquiries/rfq-service.js");
const { InMemoryRfqRateLimiter } = require("../.rfq-test-build/features/enquiries/rate-limit.js");
const { FilesystemEnquiryRepository } = require("../.rfq-test-build/features/enquiries/filesystem-repository.js");
const { createEnquiryNotifier } = require("../.rfq-test-build/features/enquiries/notifier.js");

const now = Date.now();
const context = { products: [{ id: "product-1", slug: "mastermax-engine-oils" }], categoryIds: ["engine-oils", "greases"], industrySlugs: ["manufacturing"] };
const base = { name: "Synthetic Test Buyer", company: "Example Test Company", phone: "+254 700 000 000", email: "", businessType: "fleet-operator", productSlug: "mastermax-engine-oils", categoryId: "", unsure: false, gradeOrViscosity: "15W-40", specification: "API CI-4", application: "Synthetic fleet", quantity: "20", quantityUnit: "litres", location: "Test Town", message: "Synthetic test record only.", consent: true, source: "product-page", sourcePage: "/products/engine-oils/mastermax-engine-oils", industrySlug: "", idempotencyKey: crypto.randomUUID(), formStartedAt: now - 2000, website: "" };
const valid = (overrides = {}) => ({ ...base, idempotencyKey: crypto.randomUUID(), ...overrides });
const tests = [];
function test(name, fn) { tests.push([name, fn]); }
function expectValid(payload) { assert.equal(validateRfqPayload(payload, context, now).success, true); }
function expectError(payload, field) { const result = validateRfqPayload(payload, context, now); assert.equal(result.success, false); assert.ok(result.errors[field]); }

test("01 empty submission", () => expectError({}, "name"));
test("02 valid phone-only enquiry", () => expectValid(valid()));
test("03 valid email-only enquiry", () => expectValid(valid({ phone: "", email: "buyer@example.test" })));
test("04 phone and email enquiry", () => expectValid(valid({ email: "buyer@example.test" })));
test("05 valid product context resolves stable ID", () => { const r = validateRfqPayload(valid(), context, now); assert.equal(r.success && r.productId, "product-1"); });
test("06 invalid product", () => expectError(valid({ productSlug: "invented" }), "productSlug"));
test("07 Product Finder source", () => expectValid(valid({ source: "product-finder", sourcePage: "/product-finder" })));
test("08 product and Product Finder source", () => expectValid(valid({ source: "product-finder" })));
test("09 category-only enquiry", () => expectValid(valid({ productSlug: "", categoryId: "greases" })));
test("10 unknown product requirement", () => expectValid(valid({ productSlug: "", unsure: true })));
test("11 quantity and unit", () => expectValid(valid({ quantity: "4", quantityUnit: "drums" })));
test("12 no quantity", () => expectValid(valid({ quantity: "", quantityUnit: "" })));
test("13 honeypot filled", () => expectError(valid({ website: "spam.example" }), "website"));
test("14 malformed email", () => expectError(valid({ email: "bad-address" }), "email"));
test("15 oversized message", () => expectError(valid({ message: "x".repeat(rfqLimits.message + 1) }), "message"));
test("16 invalid enum", () => expectError(valid({ businessType: "invented" }), "businessType"));
test("17 invalid source", () => expectError(valid({ source: "campaign-name" }), "source"));
test("18 timing protection", () => expectError(valid({ formStartedAt: now - 100 }), "formStartedAt"));
test("19 invalid category", () => expectError(valid({ productSlug: "", categoryId: "old-route" }), "categoryId"));
test("20 invalid quantity", () => expectError(valid({ quantity: "-1" }), "quantity"));
test("21 quantity requires unit", () => expectError(valid({ quantity: "20", quantityUnit: "" }), "quantityUnit"));
test("22 consent required", () => expectError(valid({ consent: false }), "consent"));
test("23 valid industry context", () => expectValid(valid({ industrySlug: "manufacturing" })));
test("24 invalid industry context", () => expectError(valid({ industrySlug: "invented" }), "industrySlug"));

class MemoryRepository {
  records = [];
  fail = false;
  async findByIdempotencyKey(key) { return this.records.find((r) => r.idempotencyKey === key) ?? null; }
  async create(record) { if (this.fail) throw new Error("synthetic storage failure"); const complete = { ...record, id: crypto.randomUUID(), referenceNumber: "RFQ-2026-ABC123", createdAt: new Date(now).toISOString(), updatedAt: new Date(now).toISOString() }; this.records.push(complete); return complete; }
  async findById(id) { return this.records.find((r) => r.id === id) ?? null; }
  async updateNotificationStatus(id, status, attempts) { const record = await this.findById(id); Object.assign(record, { notificationStatus: status, notificationAttempts: attempts }); return record; }
}
class Notifier { constructor(behavior = "unavailable") { this.behavior = behavior; } async notifySales() { if (this.behavior === "throw") throw new Error("synthetic notifier failure"); return { status: this.behavior }; } }

test("25 duplicate submission is idempotent", async () => { const repo = new MemoryRepository(); const service = new RfqService(repo, new Notifier(), new InMemoryRfqRateLimiter()); const payload = valid(); const a = await service.submit({ raw: payload, context, requestFingerprint: "a", now }); const b = await service.submit({ raw: payload, context, requestFingerprint: "a", now }); assert.equal(a.referenceNumber, b.referenceNumber); assert.equal(repo.records.length, 1); });
test("26 rate limit returns typed outcome", async () => { const service = new RfqService(new MemoryRepository(), new Notifier(), new InMemoryRfqRateLimiter(1, 60000)); await service.submit({ raw: valid(), context, requestFingerprint: "rate", now }); const r = await service.submit({ raw: valid(), context, requestFingerprint: "rate", now }); assert.equal(r.type, "rate_limited"); });
test("27 notifier failure preserves stored record", async () => { const repo = new MemoryRepository(); const service = new RfqService(repo, new Notifier("throw"), new InMemoryRfqRateLimiter()); const r = await service.submit({ raw: valid(), context, requestFingerprint: "notify", now }); assert.equal(r.type, "success"); assert.equal(repo.records.length, 1); assert.equal(repo.records[0].notificationStatus, "failed"); });
test("28 storage failure never returns success", async () => { const repo = new MemoryRepository(); repo.fail = true; const service = new RfqService(repo, new Notifier(), new InMemoryRfqRateLimiter()); assert.equal((await service.submit({ raw: valid(), context, requestFingerprint: "storage", now })).type, "storage_error"); });
test("29 filesystem persistence stores a synthetic record", async () => { const directory = await mkdtemp(path.join(tmpdir(), "haribol-rfq-")); try { const repo = new FilesystemEnquiryRepository(directory); const service = new RfqService(repo, new Notifier("unavailable"), new InMemoryRfqRateLimiter()); const result = await service.submit({ raw: valid(), context, requestFingerprint: "filesystem", now }); assert.equal(result.type, "success"); const files = await readdir(directory); assert.equal(files.length, 1); const stored = JSON.parse(await readFile(path.join(directory, files[0]), "utf8")); assert.equal(stored.referenceNumber, result.referenceNumber); assert.equal(stored.notificationStatus, "unavailable"); } finally { await rm(directory, { recursive: true, force: true }); } });
test("30 Postmark adapter sends plain text with safe Reply-To", async () => {
  let request;
  const fakeFetch = async (url, options) => { request = { url, options }; return new Response(JSON.stringify({ MessageID: "synthetic" }), { status: 200 }); };
  const notifier = createEnquiryNotifier({ EMAIL_PROVIDER: "postmark", EMAIL_API_KEY: "test-token", EMAIL_FROM: "verified@example.test", RFQ_NOTIFICATION_EMAIL: "info@mastermax.co.ke" }, fakeFetch);
  const repo = new MemoryRepository();
  const service = new RfqService(repo, notifier, new InMemoryRfqRateLimiter());
  const result = await service.submit({ raw: valid({ email: "buyer@example.test", message: "<script>alert(1)</script>" }), context, requestFingerprint: "postmark", now });
  assert.equal(result.type, "success");
  assert.equal(repo.records[0].notificationStatus, "sent");
  assert.equal(request.url, "https://api.postmarkapp.com/email");
  const body = JSON.parse(request.options.body);
  assert.equal(body.To, "info@mastermax.co.ke");
  assert.equal(body.From, "verified@example.test");
  assert.equal(body.ReplyTo, "buyer@example.test");
  assert.equal(body.HtmlBody, undefined);
  assert.match(body.Subject, /RFQ-2026-ABC123/);
  assert.match(body.TextBody, /<script>alert\(1\)<\/script>/);
});
test("31 Postmark provider failure preserves the stored enquiry", async () => {
  const fakeFetch = async () => new Response("failure", { status: 503 });
  const notifier = createEnquiryNotifier({ EMAIL_PROVIDER: "postmark", EMAIL_API_KEY: "test-token", EMAIL_FROM: "verified@example.test", RFQ_NOTIFICATION_EMAIL: "info@mastermax.co.ke" }, fakeFetch);
  const repo = new MemoryRepository();
  const service = new RfqService(repo, notifier, new InMemoryRfqRateLimiter());
  const result = await service.submit({ raw: valid(), context, requestFingerprint: "postmark-failure", now });
  assert.equal(result.type, "success");
  assert.equal(repo.records[0].notificationStatus, "failed");
  assert.equal(repo.records[0].notificationAttempts, 1);
});
test("32 malformed Reply-To is never sent", async () => {
  let body;
  const fakeFetch = async (_url, options) => { body = JSON.parse(options.body); return new Response("{}", { status: 200 }); };
  const notifier = createEnquiryNotifier({ EMAIL_PROVIDER: "postmark", EMAIL_API_KEY: "test-token", EMAIL_FROM: "verified@example.test", RFQ_NOTIFICATION_EMAIL: "info@mastermax.co.ke" }, fakeFetch);
  await notifier.notifySales({ ...new MemoryRepository(), email: "attacker@example.test\r\nBcc: victim@example.test", referenceNumber: "RFQ-2026-SAFE01", createdAt: new Date(now).toISOString(), name: "Test", company: "", phone: "", businessType: "", productSlug: null, categoryId: "", gradeOrViscosity: "", specification: "", application: "", quantity: null, quantityUnit: "", location: "Test", message: "Test", source: "request-a-quote" });
  assert.equal(body.ReplyTo, undefined);
});

let passed = 0;
for (const [name, fn] of tests) { try { await fn(); console.log(`PASS ${name}`); passed += 1; } catch (error) { console.error(`FAIL ${name}`); throw error; } }
console.log(`RFQ validation complete: ${passed}/${tests.length} checks passed.`);
