import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [page, hero, heroVisual, categories, mastermax, industries, finder, kenya, kenyaData, trust, knowledge, quote, packageJson] = await Promise.all([
  read("src/app/(website)/page.tsx"),
  read("src/components/home/home-hero.tsx"),
  read("src/components/home/hero-industrial-visual.tsx"),
  read("src/components/home/product-categories.tsx"),
  read("src/components/home/mastermax-showcase.tsx"),
  read("src/components/home/industries-section.tsx"),
  read("src/components/home/product-finder-feature.tsx"),
  read("src/components/home/kenya-presence.tsx"),
  read("src/data/kenya-map.ts"),
  read("src/components/home/why-haribol.tsx"),
  read("src/components/home/knowledge-section.tsx"),
  read("src/components/home/quote-cta.tsx"),
  read("package.json"),
]);

const tests = [];
const test = (name, run) => tests.push([name, run]);

test("01 homepage keeps one explicit hero", () => assert.match(page, /<HomeHero \/>/));
test("02 business positioning follows hero", () => assert.ok(page.indexOf("<HomeHero") < page.indexOf("<BusinessIntro")));
test("03 categories follow positioning", () => assert.ok(page.indexOf("<BusinessIntro") < page.indexOf("<ProductCategories")));
test("04 Mastermax follows categories", () => assert.ok(page.indexOf("<ProductCategories") < page.indexOf("<MastermaxShowcase")));
test("05 industries follow Mastermax", () => assert.ok(page.indexOf("<MastermaxShowcase") < page.indexOf("<IndustriesSection")));
test("06 Product Finder follows industries", () => assert.ok(page.indexOf("<IndustriesSection") < page.indexOf("<ProductFinderFeature")));
test("07 Kenya follows Product Finder", () => assert.ok(page.indexOf("<ProductFinderFeature") < page.indexOf("<KenyaPresence")));
test("08 trust follows Kenya", () => assert.ok(page.indexOf("<KenyaPresence") < page.indexOf("<WhyHaribol")));
test("09 knowledge follows trust", () => assert.ok(page.indexOf("<WhyHaribol") < page.indexOf("<KnowledgeSection")));
test("10 RFQ remains the final homepage section", () => assert.ok(page.indexOf("<KnowledgeSection") < page.indexOf("<QuoteCta")));
test("11 hero has exactly one h1 source", () => assert.equal((hero.match(/<h1/g) || []).length, 1));
test("12 products is the primary hero route", () => assert.match(hero, /href="\/products"[\s\S]*?Explore Products/));
test("13 RFQ remains in the hero", () => assert.match(hero, /href="\/request-a-quote"/));
test("14 hero uses the shared WhatsApp pathway", () => assert.match(hero, /<WhatsAppLink[\s\S]*?source="homepage"/));
test("15 hero preserves its dedicated visual slot", () => assert.match(heroVisual, /data-visual-slot="hero"/));
test("16 all approved categories remain data-driven", () => assert.match(categories, /productCategories\.map/));
test("17 categories reserve future visual slots", () => assert.match(categories, /data-visual-slot="category"/));
test("18 Mastermax remains catalogue-driven", () => assert.match(mastermax, /mastermaxCatalogueTaxonomy\.map/));
test("19 Mastermax reserves a future visual slot", () => assert.match(mastermax, /data-visual-slot="mastermax"/));
test("20 all approved industries remain data-driven", () => assert.match(industries, /industries\.map/));
test("21 Product Finder preserves its canonical route", () => assert.match(finder, /href="\/product-finder"/));
test("22 Product Finder explains technical confirmation", () => assert.match(finder, /confirming suitability/));
test("23 Kenya uses the verified business address config", () => { assert.match(kenya, /siteConfig\.businessAddress\.venue/); assert.match(kenya, /siteConfig\.businessAddress\.street/); assert.match(kenya, /siteConfig\.businessAddress\.locality/); });
test("24 Kenya uses a sourced map and verified reference points", () => { assert.match(kenya, /kenyaMapData\.path/); assert.match(kenyaData, /Natural Earth Admin 0 Countries/); assert.match(kenyaData, /Nearby reference city/); });
test("25 Kenya preserves the verified Maps URL", () => assert.match(kenya, /siteConfig\.businessAddress\.mapsUrl/));
test("26 trust remains sourced from approved propositions", () => assert.match(trust, /valuePropositions\.map/));
test("27 homepage reads only public CMS content", () => { assert.match(page, /getPublicInsights/); assert.match(page, /getPublicResources/); });
test("28 knowledge preserves an empty state", () => assert.match(knowledge, /hasPublishedContent[\s\S]*?emptyState/));
test("29 knowledge links both libraries", () => { assert.match(knowledge, /href="\/resources"/); assert.match(knowledge, /href="\/insights"/); });
test("30 RFQ remains primary in the final conversion section", () => assert.match(quote, /variant="primary"[\s\S]*?Request a Quote/));
test("31 no new client component was added", () => { [finder, kenya, knowledge].forEach((source) => assert.doesNotMatch(source, /["']use client["']/)); });
test("32 homepage contains no commerce action", () => [page, hero, categories, mastermax, industries, finder, kenya, trust, knowledge, quote].forEach((source) => assert.doesNotMatch(source, /add to cart|buy now|checkout/i)));
test("33 no heavy visual dependency was added", () => assert.doesNotMatch(packageJson, /three|webgl|framer-motion|gsap/i));

let passed = 0;
for (const [name, run] of tests) {
  await run();
  console.log(`PASS ${name}`);
  passed += 1;
}
console.log(`Homepage structure validation complete: ${passed}/${tests.length} checks passed.`);
