import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");
const page = read("src/components/catalogue/product-detail-page.tsx");
const styles = read("src/components/catalogue/product-detail-page.module.css");
const route = read("src/app/(website)/products/[category]/[product]/page.tsx");
const data = read("src/features/catalogue/product-page-data.ts");
const products = read("src/data/catalogue/products.ts");
const site = read("src/config/site.ts");
const disabledSlot = read("src/features/storefront/product-slot.disabled.tsx");
const enabledSlot = read("src/features/storefront/product-slot.enabled.tsx");
const productSchema = read("src/lib/seo/product-schema.ts");
const collections = read("src/cms/collections.ts");
const packageJson = JSON.parse(read("package.json"));

const checks = [
  ["dynamic product route remains unchanged", route.includes("[category]") === false && route.includes("getProductPageData(category, product)")],
  ["static route generation remains catalogue driven", route.includes("getProductStaticParams") && data.includes("products.map")],
  ["product data remains unchanged in this phase", products.includes("10W-40 API CJ-4") && products.includes('["46", "68", "100", "150", "220"]')],
  ["Product and ProductVariant remain distinct", products.includes("formulationVariant") && collections.includes('slug: "product-variants"')],
  ["all current variants remain rendered", page.includes("product.variants.map") && page.includes("variantSpecifications")],
  ["variant navigation is keyboard native", page.includes('aria-label="Product formulations"') && page.includes('href={`#variant-${variant.id}`}')],
  ["targeted formulation receives a visible state", styles.includes(".variantGrid>li:target")],
  ["RFQ remains the primary commercial action", page.includes("Request a Quote") && page.includes("href={data.quotePath}")],
  ["RFQ product prefill remains unchanged", data.includes('quotePath: `/request-a-quote?product=${encodeURIComponent(product.slug)}`')],
  ["WhatsApp keeps controlled product context", page.includes('type: "product" as const') && page.includes('source="product-page"')],
  ["technical information uses a semantic table", page.includes("<table>") && page.includes('scope="row"') && page.includes("<caption")],
  ["applications remain catalogue relationships", page.includes("data.applications.map") && data.includes("product.applicationIds.includes")],
  ["industries remain catalogue relationships", page.includes("data.industries.map") && data.includes("product.industryIds.includes")],
  ["pack sizes render only when verified data exists", page.includes("packagedVariants") && page.includes("variant.packSize")],
  ["technical documents render only when present", page.includes("product.documents.length") && page.includes("document.fileUrl")],
  ["missing optional resource content is omitted", page.includes("showSupply ?") && !page.includes("Not available") && !page.includes("N/A")],
  ["related products remain data driven", page.includes("data.relatedProducts.map") && data.includes("relatedProductScore")],
  ["fallback is technical rather than fictional packaging", page.includes("ProductTechnicalFallback") && page.includes("TECHNICAL PRODUCT VISUAL")],
  ["product imagery keeps Next image optimization", page.includes('from "next/image"') && page.includes("sizes=")],
  ["future storefront boundary remains route isolated", route.includes("<StorefrontProductSlot") && enabledSlot.includes("ProductCommercePanel")],
  ["disabled storefront renders no markup", disabledSlot.includes("return null")],
  ["commerce remains disabled", site.includes("commerceEnabled: false")],
  ["no price UI is present", !/KSh|regular price|sale price|promotional price/i.test(page)],
  ["no stock UI is present", !/in stock|available now|ships today|ready for delivery/i.test(page)],
  ["no cart or Buy Now UI is present", !/add to cart|buy now|checkout/i.test(page)],
  ["no payment method UI is present", !/M-Pesa|card payment|bank transfer|cash on delivery|pay on collection/i.test(page)],
  ["Offer schema remains gated by disabled commerce", productSchema.includes("!siteConfig.commerceEnabled") && !route.includes("createOfferSchemaCandidate")],
  ["draft and noindex metadata remain preserved", data.includes('publicationStatus === "published" && product.seo.indexable') && route.includes("indexable: data.indexable")],
  ["document delivery architecture remains controlled", collections.includes('slug: "technical-documents"') && collections.includes('relationTo: "private-documents"')],
  ["page stays server rendered", !page.includes('"use client"') && !page.includes("useState") && !page.includes("useEffect")],
  ["Light and Dark use shared semantic tokens", styles.includes("var(--color-background)") && styles.includes("var(--color-panel)")],
  ["mobile technical table avoids horizontal overflow", styles.includes(".tableFrame table,.tableFrame tbody,.tableFrame tr,.tableFrame th,.tableFrame td{display:block}")],
  ["coarse pointers remove image hover movement", styles.includes("@media(hover:none),(pointer:coarse)")],
  ["reduced motion is supported", styles.includes("@media(prefers-reduced-motion:reduce)")],
  ["no heavy visual dependency was added", !Object.keys(packageJson.dependencies).some((name) => ["three", "@react-three/fiber", "@react-three/drei", "gsap", "swiper"].includes(name))],
];

let failures = 0;
checks.forEach(([label, passed], index) => {
  if (!passed) failures += 1;
  console.log(`${passed ? "PASS" : "FAIL"} ${String(index + 1).padStart(2, "0")} ${label}`);
});
if (failures) {
  console.error(`Product detail validation failed: ${failures}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`Product detail validation complete: ${checks.length}/${checks.length} checks passed.`);
