import { getPayload } from "payload";

import config from "@payload-config";
import { assertCmsEnvironment } from "@/cms/environment";

function check(label: string, condition: boolean): void {
  if (!condition) throw new Error(`FAIL ${label}`);
  console.info(`PASS ${label}`);
}

assertCmsEnvironment();
const payload = await getPayload({ config });
check("no offers before synthetic checkout test", (await payload.count({ collection: "product-offers", overrideAccess: true })).totalDocs === 0);
check("no orders before synthetic checkout test", (await payload.count({ collection: "orders", overrideAccess: true })).totalDocs === 0);
check("no transactions before synthetic checkout test", (await payload.count({ collection: "payment-transactions", overrideAccess: true })).totalDocs === 0);

const product = (await payload.find({ collection: "products", limit: 1, depth: 0, overrideAccess: true })).docs[0];
const variant = (await payload.find({ collection: "product-variants", limit: 1, depth: 0, overrideAccess: true })).docs[0];
const kenya = (await payload.find({ collection: "markets", where: { code: { equals: "KE" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0];
if (!product || !variant || !kenya) throw new Error("Seed the existing catalogue before checkout database validation.");

const suffix = Date.now();
const admin = await payload.create({ collection: "users", overrideAccess: true, data: { email: `phase25d-admin-${suffix}@example.invalid`, password: `Synthetic-${suffix}-Admin!`, name: "Phase 25D Synthetic Admin", role: "admin" } });
const editor = await payload.create({ collection: "users", overrideAccess: true, data: { email: `phase25d-editor-${suffix}@example.invalid`, password: `Synthetic-${suffix}-Editor!`, name: "Phase 25D Synthetic Editor", role: "editor" } });

const offer = await payload.create({ collection: "product-offers", overrideAccess: false, user: admin, data: {
  displayName: "Synthetic Checkout Pack", product: product.id, variant: variant.id, sku: `SYN-25D-${suffix}`, packSize: 20, packUnit: "l", containerType: "pail",
  commerceMode: "buy-online", active: true, priceVisibility: "public", currency: "KES", regularPriceMinor: 100_000, inventoryMode: "tracked", stockQuantity: 10,
  availabilityStatus: "in-stock", minimumOrderQuantity: 1, maximumOrderQuantity: 5, markets: [kenya.id], taxClass: "unknown", taxTreatment: "unknown",
  publicationStatus: "published", verificationStatus: "needs-review", sortOrder: 100,
} });

const orderData = {
  referenceNumber: `ORD-2026-${String(suffix).slice(-6)}`,
  idempotencyKey: `phase25d-${suffix}-idempotency`,
  source: "website-checkout" as const,
  customerName: "Synthetic Checkout Customer",
  company: "Synthetic Test Company",
  phone: "+254700000000",
  email: "phase25d@example.invalid",
  deliveryLocation: "Synthetic Test Town",
  deliveryInstructions: "Synthetic record; delete after validation.",
  deliveryMethod: "unconfigured" as const,
  lines: [{
    offer: offer.id, product: product.id, offerIdSnapshot: String(offer.id), productIdSnapshot: String(product.id), productNameSnapshot: product.name,
    variantNameSnapshot: variant.name, offerNameSnapshot: offer.displayName, skuSnapshot: offer.sku, packSizeSnapshot: offer.packSize, packUnitSnapshot: offer.packUnit,
    containerSnapshot: offer.containerType, quantity: 2, currency: "KES" as const, regularUnitPriceMinor: 100_000, unitPriceMinor: 100_000,
    unitDiscountMinor: 0, taxClassSnapshot: "unknown" as const, taxTreatmentSnapshot: "unknown" as const, lineSubtotalMinor: 200_000,
    lineDiscountMinor: 0, lineTaxMinor: 0, lineTotalMinor: 200_000,
  }],
  currency: "KES" as const, subtotalMinor: 200_000, discountTotalMinor: 0, taxTotalMinor: 0, deliveryTotalMinor: 0, grandTotalMinor: 200_000,
  status: "pending-payment" as const, paymentStatus: "unpaid" as const,
};

let publicCreateDenied = false;
try { await payload.create({ collection: "orders", overrideAccess: false, data: orderData }); } catch { publicCreateDenied = true; }
check("public direct order creation denied", publicCreateDenied);

let editorCreateDenied = false;
try { await payload.create({ collection: "orders", overrideAccess: false, user: editor, data: orderData }); } catch { editorCreateDenied = true; }
check("editor order creation denied", editorCreateDenied);

const order = await payload.create({ collection: "orders", overrideAccess: false, user: admin, data: orderData });
check("admin creates synthetic order", order.referenceNumber === orderData.referenceNumber && order.lines?.length === 1);
check("order snapshot persisted", order.lines?.[0]?.productNameSnapshot === product.name && order.grandTotalMinor === 200_000);

let duplicateDenied = false;
try { await payload.create({ collection: "orders", overrideAccess: false, user: admin, data: { ...orderData, referenceNumber: `${orderData.referenceNumber}X` } }); } catch { duplicateDenied = true; }
check("database idempotency uniqueness enforced", duplicateDenied && (await payload.count({ collection: "orders", overrideAccess: true })).totalDocs === 1);

const attemptedFinancialEdit = await payload.update({ collection: "orders", id: order.id, overrideAccess: false, user: admin, data: { grandTotalMinor: 1 } });
check("admin financial snapshot edit blocked", attemptedFinancialEdit.grandTotalMinor === 200_000);
const processing = await payload.update({ collection: "orders", id: order.id, overrideAccess: false, user: admin, data: { status: "payment-processing", paymentStatus: "pending" } });
check("valid order status transition succeeds", processing.status === "payment-processing");
let invalidOrderTransitionDenied = false;
try { await payload.update({ collection: "orders", id: order.id, overrideAccess: false, user: admin, data: { status: "completed" } }); } catch { invalidOrderTransitionDenied = true; }
check("invalid order status transition denied", invalidOrderTransitionDenied);

const transaction = await payload.create({ collection: "payment-transactions", overrideAccess: false, user: admin, data: {
  order: order.id, provider: "other", providerReference: `SYNTHETIC-PAY-${suffix}`, amountMinor: order.grandTotalMinor, currency: order.currency, status: "pending",
} });
check("payment transaction uses order total", transaction.amountMinor === order.grandTotalMinor && transaction.currency === order.currency);
const paid = await payload.update({ collection: "payment-transactions", id: transaction.id, overrideAccess: false, user: admin, data: { status: "paid" } });
check("valid payment transition succeeds", paid.status === "paid");
let invalidPaymentTransitionDenied = false;
try { await payload.update({ collection: "payment-transactions", id: transaction.id, overrideAccess: false, user: admin, data: { status: "pending" } }); } catch { invalidPaymentTransitionDenied = true; }
check("invalid payment transition denied", invalidPaymentTransitionDenied);

let duplicateProviderReferenceDenied = false;
try { await payload.create({ collection: "payment-transactions", overrideAccess: false, user: admin, data: { order: order.id, provider: "other", providerReference: transaction.providerReference, amountMinor: order.grandTotalMinor, currency: order.currency, status: "unpaid" } }); } catch { duplicateProviderReferenceDenied = true; }
check("provider reference uniqueness enforced", duplicateProviderReferenceDenied);

let publicReadDenied = false;
try { await payload.find({ collection: "orders", overrideAccess: false, limit: 1 }); } catch { publicReadDenied = true; }
check("public order reading denied", publicReadDenied);
let editorReadDenied = false;
try { await payload.find({ collection: "payment-transactions", overrideAccess: false, user: editor, limit: 1 }); } catch { editorReadDenied = true; }
check("editor payment reading denied", editorReadDenied);
const adminRead = await payload.find({ collection: "orders", overrideAccess: false, user: admin, limit: 1 });
check("admin order reading succeeds", adminRead.totalDocs === 1);
check("order version history recorded", (await payload.countVersions({ collection: "orders", where: { parent: { equals: order.id } }, overrideAccess: true })).totalDocs >= 1);

await payload.delete({ collection: "payment-transactions", id: transaction.id, overrideAccess: true });
await payload.delete({ collection: "orders", id: order.id, overrideAccess: true });
await payload.delete({ collection: "product-offers", id: offer.id, overrideAccess: true });
await payload.delete({ collection: "users", id: editor.id, overrideAccess: true });
await payload.delete({ collection: "users", id: admin.id, overrideAccess: true });
check("synthetic offers cleaned", (await payload.count({ collection: "product-offers", overrideAccess: true })).totalDocs === 0);
check("synthetic orders cleaned", (await payload.count({ collection: "orders", overrideAccess: true })).totalDocs === 0);
check("synthetic transactions cleaned", (await payload.count({ collection: "payment-transactions", overrideAccess: true })).totalDocs === 0);

console.info("Checkout database validation complete: all synthetic records removed.");
