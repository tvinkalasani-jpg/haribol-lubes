import { getPayload } from "payload";

import config from "@payload-config";
import { assertCmsEnvironment } from "@/cms/environment";
import { calculateDiscountPercentage } from "@/lib/commerce/offers";

function check(label: string, condition: boolean): void {
  if (!condition) throw new Error(`FAIL ${label}`);
  console.info(`PASS ${label}`);
}

assertCmsEnvironment();
const payload = await getPayload({ config });
check("no offers before synthetic test", (await payload.count({ collection: "product-offers", overrideAccess: true })).totalDocs === 0);

const product = (await payload.find({ collection: "products", limit: 1, depth: 0, overrideAccess: true })).docs[0];
const variant = (await payload.find({ collection: "product-variants", limit: 1, depth: 0, overrideAccess: true })).docs[0];
const kenya = (await payload.find({ collection: "markets", where: { code: { equals: "KE" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0];
if (!product || !variant || !kenya) throw new Error("Seed products, variants and Kenya market before running commerce database validation.");

const suffix = Date.now();
const admin = await payload.create({ collection: "users", overrideAccess: true, data: { email: `phase25c-admin-${suffix}@example.invalid`, password: `Synthetic-${suffix}-Admin!`, name: "Phase 25C Synthetic Admin", role: "admin" } });
const editor = await payload.create({ collection: "users", overrideAccess: true, data: { email: `phase25c-editor-${suffix}@example.invalid`, password: `Synthetic-${suffix}-Editor!`, name: "Phase 25C Synthetic Editor", role: "editor" } });

let publicDenied = false;
try { await payload.create({ collection: "product-offers", overrideAccess: false, data: { displayName: "Denied public offer", product: product.id, commerceMode: "quote-only", active: false, priceVisibility: "quote-only", currency: "KES", inventoryMode: "on-enquiry", availabilityStatus: "available-on-enquiry", taxClass: "unknown", taxTreatment: "unknown", publicationStatus: "draft", verificationStatus: "needs-review", sortOrder: 100 } }); } catch { publicDenied = true; }
check("unauthenticated offer mutation denied", publicDenied);

let editorDenied = false;
try { await payload.create({ collection: "product-offers", overrideAccess: false, user: editor, data: { displayName: "Denied editor offer", product: product.id, commerceMode: "quote-only", active: false, priceVisibility: "quote-only", currency: "KES", inventoryMode: "on-enquiry", availabilityStatus: "available-on-enquiry", taxClass: "unknown", taxTreatment: "unknown", publicationStatus: "draft", verificationStatus: "needs-review", sortOrder: 100 } }); } catch { editorDenied = true; }
check("editor pricing mutation denied", editorDenied);

const synthetic = await payload.create({ collection: "product-offers", overrideAccess: false, user: admin, data: { displayName: "Synthetic Test Pack", product: product.id, variant: variant.id, sku: `SYNTHETIC-${suffix}`, packSize: 20, packUnit: "l", containerType: "pail", commerceMode: "both", active: false, priceVisibility: "quote-only", currency: "KES", regularPriceMinor: 1_000_000, salePriceMinor: 850_000, promotionLabel: "promotion", saleStart: "2026-10-01T00:00:00.000Z", saleEnd: "2026-10-31T23:59:59.000Z", inventoryMode: "on-enquiry", availabilityStatus: "available-on-enquiry", markets: [kenya.id], taxClass: "unknown", taxTreatment: "unknown", publicationStatus: "draft", verificationStatus: "needs-review", sortOrder: 100 } });
check("admin creates synthetic offer", synthetic.displayName === "Synthetic Test Pack");
check("synthetic prices persisted", synthetic.regularPriceMinor === 1_000_000 && synthetic.salePriceMinor === 850_000);
check("discount calculation from stored prices", calculateDiscountPercentage(Number(synthetic.regularPriceMinor), Number(synthetic.salePriceMinor)) === 15);
check("promotion dates persisted", Boolean(synthetic.saleStart && synthetic.saleEnd));
check("inventory state persisted", synthetic.inventoryMode === "on-enquiry" && synthetic.availabilityStatus === "available-on-enquiry");

let invalidSaleDenied = false;
try { await payload.update({ collection: "product-offers", id: synthetic.id, overrideAccess: false, user: admin, data: { salePriceMinor: 1_100_000 } }); } catch { invalidSaleDenied = true; }
check("invalid sale price rejected by CMS", invalidSaleDenied);

const revised = await payload.update({ collection: "product-offers", id: synthetic.id, overrideAccess: false, user: admin, data: { salePriceMinor: 800_000 } });
check("admin edits sale price", revised.salePriceMinor === 800_000);
check("price history version recorded", (await payload.countVersions({ collection: "product-offers", where: { parent: { equals: synthetic.id } }, overrideAccess: true })).totalDocs >= 1);

await payload.delete({ collection: "product-offers", id: synthetic.id, overrideAccess: true });
await payload.delete({ collection: "users", id: editor.id, overrideAccess: true });
await payload.delete({ collection: "users", id: admin.id, overrideAccess: true });
check("synthetic offer removed", (await payload.count({ collection: "product-offers", overrideAccess: true })).totalDocs === 0);
console.info("Commerce database validation complete: synthetic data removed.");
