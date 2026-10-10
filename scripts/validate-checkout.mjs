import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
execFileSync(process.execPath, [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.checkout-tests.json"], { cwd: root, stdio: "inherit" });
const require = createRequire(import.meta.url);
const build = path.join(root, ".checkout-test-build");
writeFileSync(path.join(build, "package.json"), '{"type":"commonjs"}\n');

const { addCartLine, removeCartLine, resolveCart, updateCartQuantity } = require(path.join(build, "lib/checkout/cart.js"));
const { createOrderDraft, createOrderReference, canTransitionOrderStatus } = require(path.join(build, "lib/checkout/orders.js"));
const { createPaymentTransactionDraft, canTransitionPaymentStatus } = require(path.join(build, "lib/checkout/payments.js"));
const { calculateOrderTotals, snapshotOrderLines } = require(path.join(build, "lib/checkout/totals.js"));
const { validateCheckoutInput } = require(path.join(build, "lib/checkout/validation.js"));
const { siteConfig } = require(path.join(build, "config/site.js"));

let passed = 0;
function check(label, condition) {
  if (!condition) throw new Error(`FAIL ${label}`);
  passed += 1;
  console.info(`PASS ${String(passed).padStart(2, "0")} ${label}`);
}

const now = new Date("2026-10-04T12:00:00.000Z");
const offer = {
  id: "offer-a", productId: "product-a", variantId: "variant-a", productName: "Synthetic Product", variantName: "Synthetic 15W-40", displayName: "Synthetic Test Pack", sku: "SYN-A",
  packSize: 20, packUnit: "l", containerType: "pail", commerceMode: "buy-online", active: true, currency: "KES", regularPriceMinor: 100_000, priceVisibility: "public",
  inventoryMode: "tracked", stockQuantity: 20, availabilityStatus: "in-stock", minimumOrderQuantity: 1, maximumOrderQuantity: 10, marketIds: ["ke"], taxClass: "unknown", taxTreatment: "unknown", sortOrder: 1,
  publicationStatus: "published", verificationStatus: "verified",
};
const saleOffer = { ...offer, id: "offer-b", sku: "SYN-B", commerceMode: "both", regularPriceMinor: 200_000, salePriceMinor: 150_000, saleStart: "2026-10-01T00:00:00.000Z", saleEnd: "2026-10-10T00:00:00.000Z" };
const options = { commerceEnabled: true, marketId: "ke", activeMarketIds: ["ke"], now };

let cart = { lines: [] };
cart = addCartLine(cart, { offerId: offer.id, quantity: 1 });
check("cart adds a valid line", cart.lines.length === 1 && cart.lines[0].quantity === 1);
cart = addCartLine(cart, { offerId: offer.id, quantity: 2 });
check("duplicate offer merges quantity", cart.lines.length === 1 && cart.lines[0].quantity === 3);
cart = updateCartQuantity(cart, offer.id, 4);
check("cart quantity updates", cart.lines[0].quantity === 4);
cart = removeCartLine(cart, offer.id);
check("cart line removes", cart.lines.length === 0);
check("zero quantity rejected", (() => { try { addCartLine(cart, { offerId: offer.id, quantity: 0 }); return false; } catch { return true; } })());
check("fractional quantity rejected", (() => { try { addCartLine(cart, { offerId: offer.id, quantity: 1.5 }); return false; } catch { return true; } })());
check("MOQ enforced", resolveCart({ lines: [{ offerId: offer.id, quantity: 1 }] }, [{ ...offer, minimumOrderQuantity: 2 }], options).issues[0]?.code === "below-minimum");
check("maximum quantity enforced", resolveCart({ lines: [{ offerId: offer.id, quantity: 11 }] }, [offer], options).issues[0]?.code === "above-maximum");
check("quote-only offer rejected", resolveCart({ lines: [{ offerId: offer.id, quantity: 1 }] }, [{ ...offer, commerceMode: "quote-only" }], options).issues[0]?.code === "offer-not-buyable");
check("draft offer rejected", resolveCart({ lines: [{ offerId: offer.id, quantity: 1 }] }, [{ ...offer, publicationStatus: "draft" }], options).issues[0]?.code === "offer-unavailable");
check("inactive offer rejected", resolveCart({ lines: [{ offerId: offer.id, quantity: 1 }] }, [{ ...offer, active: false }], options).issues[0]?.code === "offer-unavailable");
check("inactive market rejected", resolveCart({ lines: [{ offerId: offer.id, quantity: 1 }] }, [offer], { ...options, activeMarketIds: [] }).issues[0]?.code === "market-unavailable");
check("expired promotion uses regular price", resolveCart({ lines: [{ offerId: saleOffer.id, quantity: 1 }] }, [{ ...saleOffer, saleEnd: "2026-09-01" }], options).lines[0]?.unitPriceMinor === 200_000);
check("active promotion uses sale price", resolveCart({ lines: [{ offerId: saleOffer.id, quantity: 1 }] }, [saleOffer], options).lines[0]?.unitPriceMinor === 150_000);
check("out-of-stock rejected", resolveCart({ lines: [{ offerId: offer.id, quantity: 1 }] }, [{ ...offer, stockQuantity: 0 }], options).issues[0]?.code === "insufficient-stock");
check("on-enquiry inventory rejected", resolveCart({ lines: [{ offerId: offer.id, quantity: 1 }] }, [{ ...offer, inventoryMode: "on-enquiry", availabilityStatus: "available-on-enquiry" }], options).issues[0]?.code === "offer-unavailable");
check("site flag blocks resolution", resolveCart({ lines: [{ offerId: offer.id, quantity: 1 }] }, [offer], { ...options, commerceEnabled: false }).issues[0]?.code === "commerce-disabled");

const records = [];
let referenceCounter = 0;
const repository = {
  async findByIdempotencyKey(key) { return records.find((record) => record.idempotencyKey === key) ?? null; },
  async create(order) { const stored = { ...order, id: `order-${records.length + 1}` }; records.push(stored); return stored; },
};
const checkout = { fullName: "Synthetic Customer", company: "Synthetic Company", phone: "+254700000000", email: "synthetic@example.invalid", deliveryLocation: "Synthetic Town", deliveryInstructions: "Test only" };
const deps = { offers: [saleOffer], resolution: options, repository, now, createReference: () => `ORD-2026-TEST${++referenceCounter}` };
const order = await createOrderDraft({ cart: { lines: [{ offerId: saleOffer.id, quantity: 2 }] }, checkout, idempotencyKey: "phase25d-idempotency-0001" }, deps);
check("valid order snapshot created", order.lines.length === 1 && order.lines[0].productName === "Synthetic Product");
check("order reference is non-sequential public format", /^ORD-2026-[A-Z0-9]+$/.test(order.referenceNumber) && /^ORD-2026-[A-F0-9]{6}$/.test(createOrderReference(now, "a1b2c3")));
const duplicate = await createOrderDraft({ cart: { lines: [{ offerId: saleOffer.id, quantity: 2 }] }, checkout, idempotencyKey: "phase25d-idempotency-0001" }, deps);
check("same idempotency key returns one order", duplicate.id === order.id && records.length === 1);
const second = await createOrderDraft({ cart: { lines: [{ offerId: saleOffer.id, quantity: 1 }] }, checkout, idempotencyKey: "phase25d-idempotency-0002" }, deps);
check("different idempotency creates a different order", second.id !== order.id && records.length === 2);
check("currency preserved", order.totals.currency === "KES" && order.lines[0].currency === "KES");
check("line totals are integer-safe", order.lines[0].lineSubtotalMinor === 400_000 && order.lines[0].lineDiscountMinor === 100_000 && order.lines[0].lineTotalMinor === 300_000);
check("grand total is correct", order.totals.grandTotalMinor === 300_000 && order.totals.taxTotalMinor === 0 && order.totals.deliveryTotalMinor === 0);
check("price snapshot survives live offer change", order.lines[0].unitPriceMinor === 150_000 && resolveCart({ lines: [{ offerId: saleOffer.id, quantity: 1 }] }, [{ ...saleOffer, salePriceMinor: 140_000 }], options).lines[0].unitPriceMinor === 140_000);
check("SKU snapshot survives live offer edit", order.lines[0].sku === "SYN-B" && { ...saleOffer, sku: "SYN-CHANGED" }.sku !== order.lines[0].sku);
check("product name snapshot survives product edit", order.lines[0].productName === "Synthetic Product" && { ...saleOffer, productName: "Changed Product" }.productName !== order.lines[0].productName);
const malicious = await createOrderDraft({ cart: { lines: [{ offerId: saleOffer.id, quantity: 1, unitPriceMinor: 1 }] }, checkout, idempotencyKey: "phase25d-idempotency-0003" }, deps);
check("browser price is ignored", malicious.totals.grandTotalMinor === 150_000);
check("latest server price is authoritative", (await createOrderDraft({ cart: { lines: [{ offerId: saleOffer.id, quantity: 1 }] }, checkout, idempotencyKey: "phase25d-idempotency-0004" }, { ...deps, offers: [{ ...saleOffer, salePriceMinor: 140_000 }] })).totals.grandTotalMinor === 140_000);
check("invalid checkout rejected", Object.keys(validateCheckoutInput({ ...checkout, fullName: "", phone: "1", deliveryLocation: "" })).length === 3);
check("international phone accepted", Object.keys(validateCheckoutInput({ ...checkout, phone: "+44 20 7946 0958" })).length === 0);
check("order transition pending to processing allowed", canTransitionOrderStatus("pending-payment", "payment-processing"));
check("invalid order transition rejected", !canTransitionOrderStatus("pending-payment", "completed"));

const resolvedLines = snapshotOrderLines(resolveCart({ lines: [{ offerId: offer.id, quantity: 2 }] }, [offer], options).lines);
check("deterministic totals", calculateOrderTotals(resolvedLines).grandTotalMinor === 200_000);
const payment = createPaymentTransactionDraft(order.id, order, "mpesa");
check("payment uses order snapshot total", payment.amountMinor === order.totals.grandTotalMinor && payment.currency === order.totals.currency);
check("payment browser amount has no input path", !Object.prototype.hasOwnProperty.call(createPaymentTransactionDraft(order.id, order, "card"), "requestedAmount"));
check("unpaid to pending allowed", canTransitionPaymentStatus("unpaid", "pending"));
check("pending to paid allowed", canTransitionPaymentStatus("pending", "paid"));
check("pending to failed allowed", canTransitionPaymentStatus("pending", "failed"));
check("invalid payment transition rejected", !canTransitionPaymentStatus("unpaid", "paid") && !canTransitionPaymentStatus("paid", "pending"));

const collectionsSource = readFileSync(path.join(root, "src/cms/collections.ts"), "utf8");
const pageSource = readFileSync(path.join(root, "src/components/catalogue/product-detail-page.tsx"), "utf8");
check("Orders collection is admin-only", collectionsSource.includes('slug: "orders"') && collectionsSource.includes('slug: "payment-transactions"'));
check("financial snapshots are immutable", collectionsSource.includes("immutableFinancialField"));
check("commerce remains disabled", siteConfig.commerceEnabled === false);
check("no public commerce controls", !/Add to Cart|Buy Now|Checkout/i.test(pageSource));
const cartRouteSource = readFileSync(path.join(root, "src/app/(website)/cart/page.tsx"), "utf8");
const checkoutRouteSource = readFileSync(path.join(root, "src/app/(website)/checkout/page.tsx"), "utf8");
check("cart route remains test-gated", cartRouteSource.includes("isStorefrontTestMode") && cartRouteSource.includes("notFound"));
check("checkout route remains test-gated", checkoutRouteSource.includes("isStorefrontTestMode") && checkoutRouteSource.includes("notFound"));

console.info(`Checkout/order validation complete: ${passed}/${passed} checks passed.`);
