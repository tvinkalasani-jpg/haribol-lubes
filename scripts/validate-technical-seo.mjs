import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const origin = (process.env.SEO_TEST_ORIGIN || "http://localhost:3027").replace(/\/$/, "");
const production = "https://haribollubesltd.co.ke";
const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");
const fetchPage = async (path, redirect = "follow") => {
  const response = await fetch(`${origin}${path}`, { redirect });
  return { response, text: await response.text() };
};
const meta = (html, name) => html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"))?.[1]
  || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"))?.[1] || "";
const canonical = (html) => html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
  || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1] || "";
const schemas = (html) => [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((entry) => JSON.parse((entry[1] || "").replaceAll("&quot;", '"')));
const graphTypes = (html) => schemas(html).flatMap((schema) => (schema["@graph"] || [schema]).map((node) => node["@type"]));
let passed = 0;
const test = (name, check) => { check(); passed += 1; console.log(`PASS ${String(passed).padStart(2, "0")} ${name}`); };

const [home, products, filteredProducts, finder, filteredFinder, insights, filteredInsights, article, about, contact, resources, rfq, privacy, terms, draftProduct, robots, sitemap] = await Promise.all([
  fetchPage("/"), fetchPage("/products"), fetchPage("/products?q=oil"), fetchPage("/product-finder"), fetchPage("/product-finder?application=industrial-machinery"), fetchPage("/insights"), fetchPage("/insights?category=technical-guides"), fetchPage("/insights/understanding-sae-viscosity-grades"), fetchPage("/about"), fetchPage("/contact"), fetchPage("/resources"), fetchPage("/request-a-quote?source=header"), fetchPage("/privacy"), fetchPage("/terms"), fetchPage("/products/engine-oils/mastermax-engine-oils"), fetchPage("/robots.txt"), fetchPage("/sitemap.xml"),
]);
const sitemapUrls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((entry) => entry[1]);
const organization = schemas(home.text).flatMap((schema) => schema["@graph"] || [schema]).find((node) => node["@type"] === "Organization");
const address = organization?.address;
const articleNode = schemas(article.text).flatMap((schema) => schema["@graph"] || [schema]).find((node) => node["@type"] === "Article");

test("production canonical origin", () => assert.equal(canonical(home.text), production));
test("no localhost canonical", () => assert.equal([home, products, article].some(({ text }) => canonical(text).includes("localhost")), false));
test("robots production allows public crawl", () => assert.match(robots.text, /Allow: \//));
test("robots production blocks admin", () => assert.match(robots.text, /Disallow: \/admin\//));
test("robots production blocks API", () => assert.match(robots.text, /Disallow: \/api\//));
test("robots production advertises sitemap", () => assert.match(robots.text, /Sitemap: https:\/\/haribollubesltd\.co\.ke\/sitemap\.xml/));
test("robots staging source defaults closed", () => assert.match(read("src/app/robots.ts"), /disallow: "\/"/));
test("environment switch is explicit", () => assert.match(read("src/lib/seo/environment.ts"), /=== "production"/));
test("sitemap is valid XML", () => { assert.match(sitemap.text, /<urlset/); assert.match(sitemap.text, /<\/urlset>/); });
test("sitemap uses production host", () => assert.equal(sitemapUrls.every((url) => url.startsWith(`${production}/`)), true));
test("sitemap excludes admin", () => assert.equal(sitemapUrls.some((url) => url.includes("/admin")), false));
test("sitemap excludes cart", () => assert.equal(sitemapUrls.some((url) => url.endsWith("/cart")), false));
test("sitemap excludes checkout", () => assert.equal(sitemapUrls.some((url) => url.endsWith("/checkout")), false));
test("sitemap excludes RFQ", () => assert.equal(sitemapUrls.some((url) => url.includes("request-a-quote")), false));
test("sitemap excludes draft products", () => assert.equal(sitemapUrls.some((url) => url.includes("mastermax-engine-oils")), false));
test("sitemap includes product categories", () => assert.equal(sitemapUrls.includes(`${production}/products/engine-oils`), true));
test("sitemap includes industries", () => assert.equal(sitemapUrls.includes(`${production}/industries/construction`), true));
test("sitemap excludes unapproved draft insight", () => assert.equal(sitemapUrls.includes(`${production}/insights/understanding-sae-viscosity-grades`), false));
test("sitemap code filters editor indexability", () => assert.match(read("src/app/sitemap.ts"), /insight\.seo\.indexable/));
test("products filter canonical", () => assert.equal(canonical(filteredProducts.text), `${production}/products`));
test("products filter noindex follow", () => assert.equal(meta(filteredProducts.text, "robots"), "noindex, follow"));
test("Finder base is indexable", () => assert.equal(meta(finder.text, "robots"), "index, follow"));
test("Finder parameter canonical", () => assert.equal(canonical(filteredFinder.text), `${production}/product-finder`));
test("Finder parameter noindex follow", () => assert.equal(meta(filteredFinder.text, "robots"), "noindex, follow"));
test("Insight filter canonical", () => assert.equal(canonical(filteredInsights.text), `${production}/insights`));
test("RFQ canonical base", () => assert.equal(canonical(rfq.text), `${production}/request-a-quote`));
test("RFQ noindex follow", () => assert.equal(meta(rfq.text, "robots"), "noindex, follow"));
test("Privacy noindex follow", () => assert.equal(meta(privacy.text, "robots"), "noindex, follow"));
test("Terms noindex follow", () => assert.equal(meta(terms.text, "robots"), "noindex, follow"));
test("Organization schema", () => assert.equal(organization?.legalName, "Haribol Lubes Limited"));
test("Organization verified address", () => { assert.equal(address?.streetAddress, "Emerald Business Park, Kutch Rd"); assert.equal(address?.addressLocality, "Mlolongo"); assert.equal(address?.addressCountry, "KE"); });
test("Organization omits empty sameAs", () => assert.equal("sameAs" in organization, false));
test("Organization omits public email", () => assert.equal("email" in organization, false));
test("WebSite schema", () => assert.equal(graphTypes(home.text).includes("WebSite"), true));
test("homepage has no SearchAction", () => assert.equal(home.text.includes("SearchAction"), false));
test("breadcrumb schema", () => assert.equal(graphTypes(products.text).includes("BreadcrumbList"), true));
test("draft Insight route is unavailable", () => assert.equal(article.response.status, 404));
test("draft Insight schema is suppressed", () => assert.equal(articleNode, undefined));
test("draft Product schema suppressed", () => assert.equal(graphTypes(draftProduct.text).includes("Product"), false));
test("Offer schema suppressed", () => assert.equal(draftProduct.text.includes('"@type":"Offer"'), false));
test("ContactPage schema", () => assert.equal(graphTypes(contact.text).includes("ContactPage"), true));
test("AboutPage schema", () => assert.equal(graphTypes(about.text).includes("AboutPage"), true));
test("CollectionPage schema", () => assert.equal([products, insights, resources].every(({ text }) => graphTypes(text).includes("CollectionPage")), true));
test("JSON-LD parses", () => assert.doesNotThrow(() => [home, products, article, about, contact, resources].forEach(({ text }) => schemas(text))));
test("Open Graph site name", () => assert.match(home.text, /property="og:site_name" content="Haribol Lubes"/));
test("draft Insight omits Article Open Graph type", () => assert.doesNotMatch(article.text, /property="og:type" content="article"/));
test("HTML language is English", () => assert.match(home.text, /<html lang="en"/));
test("draft product noindex", () => assert.equal(meta(draftProduct.text, "robots"), "noindex, follow"));
test("commerce remains disabled", () => assert.match(read("src/config/site.ts"), /commerceEnabled: false/));
test("no fake schema types", () => assert.equal(home.text.includes("AggregateRating") || home.text.includes("FAQPage") || home.text.includes("HowTo"), false));

console.log(`\n${passed} technical SEO assertions passed.`);
