import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

execFileSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.whatsapp-tests.json"], { stdio: "inherit" });
await writeFile(new URL("../.whatsapp-test-build/package.json", import.meta.url), '{"type":"commonjs"}\n');
const require = createRequire(import.meta.url);
const { normalizeWhatsAppNumber, buildWhatsAppMessage, buildWhatsAppUrl } = require("../.whatsapp-test-build/lib/utils/whatsapp.js");

const tests = [];
const test = (name, run) => tests.push([name, run]);
test("01 empty configuration", () => assert.equal(normalizeWhatsAppNumber(""), null));
test("02 international digits", () => assert.equal(normalizeWhatsAppNumber("254757000000"), "254757000000"));
test("03 spaced format", () => assert.equal(normalizeWhatsAppNumber("254 757 000 000"), "254757000000"));
test("04 verified plus-prefixed format", () => assert.equal(normalizeWhatsAppNumber("+254 794 205 115"), "254794205115"));
test("05 Kenyan local format", () => assert.equal(normalizeWhatsAppNumber("0757 000 000"), "254757000000"));
test("06 alphabetic value rejected", () => assert.equal(normalizeWhatsAppNumber("254 CALL HARIBOL"), null));
test("07 short number rejected", () => assert.equal(normalizeWhatsAppNumber("12345"), null));
test("08 phone punctuation accepted", () => assert.equal(normalizeWhatsAppNumber("+254 (757) 000-000"), "254757000000"));
test("09 misplaced plus rejected", () => assert.equal(normalizeWhatsAppNumber("254+757000000"), null));
test("10 general message", () => assert.equal(buildWhatsAppMessage({ type: "general" }), "Hello Haribol Lubes, I would like to make an enquiry."));
test("11 product name and page", () => assert.match(buildWhatsAppMessage({ type: "product", productName: "Mastermax Engine Oils", pageUrl: "https://haribollubesltd.co.ke/products/engine-oils/mastermax-engine-oils" }), /Product: Mastermax Engine Oils/));
test("12 category message", () => assert.match(buildWhatsAppMessage({ type: "category", categoryName: "Transmission / Gear Oils" }), /Transmission \/ Gear Oils/));
test("13 industry message", () => assert.match(buildWhatsAppMessage({ type: "industry", industryName: "Manufacturing" }), /for manufacturing\./));
test("14 Product Finder message", () => assert.match(buildWhatsAppMessage({ type: "productFinder", productName: "Mastermax Hydraulic Oils", technicalSelection: "ISO VG 46" }), /I used the Product Finder/));
test("15 RFQ reference only", () => { const message = buildWhatsAppMessage({ type: "rfqFollowUp", referenceNumber: "RFQ-2026-ABC123" }); assert.equal(message, "Hello Haribol Lubes, I submitted quotation request RFQ-2026-ABC123 and would like to follow up."); for (const personal of ["name", "company", "phone", "email", "location", "message"]) assert.equal(message.toLowerCase().includes(personal), false); });
test("16 invalid RFQ reference rejected", () => assert.equal(buildWhatsAppMessage({ type: "rfqFollowUp", referenceNumber: "arbitrary text" }), null));
test("17 ampersand is encoded", () => assert.match(buildWhatsAppUrl("+254 757 000 000", { type: "product", productName: "Oil & Grease" }), /%26/));
test("18 slash is encoded", () => assert.match(buildWhatsAppUrl("+254 757 000 000", { type: "category", categoryName: "Transmission / Gear Oils" }), /%2F/));
test("19 Unicode is encoded", () => assert.match(buildWhatsAppUrl("+254 757 000 000", { type: "product", productName: "Oil – Premium" }), /%E2%80%93/));
test("20 invalid destination produces no URL", () => assert.equal(buildWhatsAppUrl("invalid", { type: "general" }), null));
test("21 verified URL uses trusted wa.me origin", () => assert.ok(buildWhatsAppUrl("+254 794 205 115", { type: "general" }).startsWith("https://wa.me/254794205115?text=")));

let passed = 0;
for (const [name, run] of tests) { await run(); console.log(`PASS ${name}`); passed += 1; }
console.log(`WhatsApp validation complete: ${passed}/${tests.length} checks passed.`);
