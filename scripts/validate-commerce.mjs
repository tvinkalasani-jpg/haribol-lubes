import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
execFileSync(process.execPath, [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.commerce-tests.json"], { cwd: root, stdio: "inherit" });
const require = createRequire(import.meta.url);
const build = path.join(root, ".commerce-test-build");
writeFileSync(path.join(build, "package.json"), '{"type":"commonjs"}\n');

const { siteConfig } = require(path.join(build, "config/site.js"));
const { products, productVariants } = require(path.join(build, "data/catalogue/products.js"));
const { productOffers } = require(path.join(build, "data/commerce/offers.js"));
const { adminsOnly, adminsOnlyField } = require(path.join(build, "cms/access.js"));
const { formatMoney, isValidMinorAmount, minorToMajor } = require(path.join(build, "lib/commerce/money.js"));
const { calculateDiscountPercentage, getActivePrice, getAvailability, getDisplayPrice, getPromotionState, getSellableOffersForProduct } = require(path.join(build, "lib/commerce/offers.js"));
const { validateDateRange, validateMaximumQuantity, validateOptionalPositiveInteger, validateProductOffer, validateSalePrice, validateSkuUniqueness, validateStockQuantity } = require(path.join(build, "lib/commerce/validation.js"));

let passed = 0;
function check(label, condition) {
  if (!condition) throw new Error(`FAIL ${label}`);
  passed += 1;
  console.info(`PASS ${String(passed).padStart(2, "0")} ${label}`);
}

const now = new Date("2026-10-04T12:00:00.000Z");
const base = {
  id: "synthetic-offer",
  productId: products[0].id,
  displayName: "Synthetic Test Pack",
  commerceMode: "quote-only",
  active: false,
  currency: "KES",
  priceVisibility: "quote-only",
  inventoryMode: "on-enquiry",
  availabilityStatus: "available-on-enquiry",
  marketIds: ["ke"],
  taxClass: "unknown",
  taxTreatment: "unknown",
  sortOrder: 100,
  publicationStatus: "draft",
  verificationStatus: "needs-review",
};
const priced = { ...base, active: true, commerceMode: "both", priceVisibility: "public", regularPriceMinor: 1_000_000, salePriceMinor: 850_000, saleStart: "2026-10-01T00:00:00.000Z", saleEnd: "2026-10-10T00:00:00.000Z", packSize: 20, packUnit: "l", containerType: "pail", inventoryMode: "untracked", availabilityStatus: "in-stock", publicationStatus: "published" };

check("money uses safe integer minor units", isValidMinorAmount(125_000) && !isValidMinorAmount(1250.5));
check("minor units convert without floating source prices", minorToMajor({ currency: "KES", minorAmount: 125_000 }) === 1250);
check("KES formatting is Kenya-friendly", formatMoney({ currency: "KES", minorAmount: 850_000 }) === "KES 8,500");
check("regular price rejects zero", !isValidMinorAmount(0));
check("sale below regular is valid", validateSalePrice(850_000, 1_000_000) === true);
check("sale equal to regular is invalid", validateSalePrice(1_000_000, 1_000_000) !== true);
check("sale above regular is invalid", validateSalePrice(1_100_000, 1_000_000) !== true);
check("discount rounds to nearest whole percent", calculateDiscountPercentage(1_000_000, 850_000) === 15);
check("active promotion", getPromotionState(priced, now) === "active");
check("future promotion", getPromotionState({ ...priced, saleStart: "2026-11-01T00:00:00.000Z", saleEnd: "2026-11-10T00:00:00.000Z" }, now) === "scheduled");
check("expired promotion", getPromotionState({ ...priced, saleStart: "2026-09-01T00:00:00.000Z", saleEnd: "2026-09-10T00:00:00.000Z" }, now) === "expired");
check("reversed promotion dates rejected", validateDateRange("2026-10-10", "2026-10-01") !== true);
check("active price uses current sale", getActivePrice(priced, now)?.current.minorAmount === 850_000);
check("expired sale returns regular price", getActivePrice({ ...priced, saleEnd: "2026-09-01" }, now)?.current.minorAmount === 1_000_000);
check("private price has no display model", getDisplayPrice({ ...priced, priceVisibility: "quote-only" }, now) === undefined);
check("tracked inventory requires stock", validateStockQuantity(undefined, "tracked") !== true);
check("tracked inventory accepts zero", validateStockQuantity(0, "tracked") === true);
check("on-enquiry does not require stock", validateStockQuantity(undefined, "on-enquiry") === true);
check("zero tracked stock resolves out of stock", getAvailability({ ...priced, inventoryMode: "tracked", stockQuantity: 0 }) === "out-of-stock");
check("low stock threshold resolves correctly", getAvailability({ ...priced, inventoryMode: "tracked", stockQuantity: 2, lowStockThreshold: 3 }) === "low-stock");
check("optional SKU accepted", validateSkuUniqueness([], undefined) === true);
check("SKU uniqueness is case-insensitive", validateSkuUniqueness([{ id: "one", sku: "MM-20L" }], "mm-20l") !== true);
check("MOQ accepts positive integer", validateOptionalPositiveInteger(2) === true);
check("MOQ rejects fractional value", validateOptionalPositiveInteger(1.5) !== true);
check("maximum must meet minimum", validateMaximumQuantity(4, 5) !== true && validateMaximumQuantity(5, 5) === true);
check("unknown tax state is valid", validateProductOffer(base).every((issue) => issue.field !== "taxClass"));
check("quote-only mode is valid", validateProductOffer({ ...base, commerceMode: "quote-only" }).every((issue) => issue.field !== "commerceMode"));
check("buy-online mode is valid for draft architecture", validateProductOffer({ ...base, commerceMode: "buy-online" }).every((issue) => issue.field !== "commerceMode"));
check("both mode is valid", validateProductOffer({ ...base, commerceMode: "both" }).every((issue) => issue.field !== "commerceMode"));
check("published buyable offer requires price and pack", validateProductOffer({ ...base, active: true, commerceMode: "buy-online", publicationStatus: "published" }).some((issue) => issue.field === "regularPriceMinor"));
check("complete synthetic offer validates", validateProductOffer(priced).length === 0);
check("no fabricated offers seeded", productOffers.length === 0);
check("existing products unchanged", products.length === 10);
check("existing variants unchanged", productVariants.length === 21);
check("commerce remains disabled", siteConfig.commerceEnabled === false);
check("disabled commerce returns no sellable offers", getSellableOffersForProduct([priced], priced.productId, "ke", ["ke"]).length === 0);

const adminReq = { user: { role: "admin" } };
const editorReq = { user: { role: "editor" } };
const publicReq = { user: null };
check("admin pricing access allowed", adminsOnly({ req: adminReq }) === true && adminsOnlyField({ req: adminReq }) === true);
check("editor pricing access denied", adminsOnly({ req: editorReq }) === false && adminsOnlyField({ req: editorReq }) === false);
check("unauthenticated pricing access denied", adminsOnly({ req: publicReq }) === false);

const collectionsSource = readFileSync(path.join(root, "src/cms/collections.ts"), "utf8");
const productSchemaSource = readFileSync(path.join(root, "src/lib/seo/product-schema.ts"), "utf8");
const publicSource = readFileSync(path.join(root, "src/components/catalogue/product-detail-page.tsx"), "utf8");
check("Product Offers collection registered", collectionsSource.includes('slug: "product-offers"') && collectionsSource.includes("ProductOffers,"));
check("offer collection is admin-only", /access:\s*\{ create: adminsOnly, delete: adminsOnly, read: adminsOnly, update: adminsOnly \}/.test(collectionsSource));
check("price history versions retained", collectionsSource.includes("versions: { maxPerDoc: 100 }"));
check("schema mapper keeps commerce optional", productSchemaSource.includes("createOfferSchemaCandidate") && productSchemaSource.includes("commerceEnabled"));
check("no Buy or Add to Cart UI", !/Buy Now|Add to Cart/i.test(publicSource));
const cartRouteSource = readFileSync(path.join(root, "src/app/(website)/cart/page.tsx"), "utf8");
const checkoutRouteSource = readFileSync(path.join(root, "src/app/(website)/checkout/page.tsx"), "utf8");
check("cart route remains disabled outside test mode", cartRouteSource.includes("isStorefrontTestMode") && cartRouteSource.includes("notFound"));
check("checkout route remains disabled outside test mode", checkoutRouteSource.includes("isStorefrontTestMode") && checkoutRouteSource.includes("notFound"));

console.info(`Commerce validation complete: ${passed}/${passed} checks passed.`);
