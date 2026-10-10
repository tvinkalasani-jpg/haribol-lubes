import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
execFileSync(process.execPath, [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.storefront-tests.json"], { cwd: root, stdio: "inherit" });
const require = createRequire(import.meta.url);
const build = path.join(root, ".storefront-test-build");
writeFileSync(path.join(build, "package.json"), '{"type":"commonjs"}\n');

const { storefrontTestOffers, storefrontPromotionFixtures } = require(path.join(build, "data/commerce/storefront-fixtures.js"));
const { addCartLine, removeCartLine, resolveCart, updateCartQuantity } = require(path.join(build, "lib/checkout/cart.js"));
const { createOrderDraft } = require(path.join(build, "lib/checkout/orders.js"));
const { countCartUnits, parseStoredCart, serializeCart } = require(path.join(build, "lib/storefront/cart-storage.js"));
const { createOfferDisplayModel, detectPriceUpdates } = require(path.join(build, "lib/storefront/presentation.js"));
const { siteConfig } = require(path.join(build, "config/site.js"));

let passed = 0;
function check(label, condition) { if (!condition) throw new Error(`FAIL ${label}`); passed += 1; console.info(`PASS ${String(passed).padStart(2, "0")} ${label}`); }
const now = new Date("2026-10-04T12:00:00.000Z");
const [regular, sale, outOfStock, moq, quoteOnly] = storefrontTestOffers;
const future = storefrontPromotionFixtures.find((offer) => offer.id === "synthetic-future-sale");
const expired = storefrontPromotionFixtures.find((offer) => offer.id === "synthetic-expired-sale");
const options = { commerceEnabled: true, marketId: "ke", activeMarketIds: ["ke"], now };

const regularModel = createOfferDisplayModel(regular, now);
const saleModel = createOfferDisplayModel(sale, now);
check("regular price rendered", regularModel.price === "KES 2,500" && !regularModel.regularPrice);
check("active sale rendered", saleModel.price === "KES 4,250" && saleModel.regularPrice === "KES 5,000");
check("future sale stays regular", createOfferDisplayModel(future, now).price === "KES 6,000" && !createOfferDisplayModel(future, now).discount);
check("expired sale stays regular", createOfferDisplayModel(expired, now).price === "KES 6,000" && !createOfferDisplayModel(expired, now).discount);
check("quote-only has no public price", !createOfferDisplayModel(quoteOnly, now).price && createOfferDisplayModel(quoteOnly, now).showQuote);
check("both mode supports cart and quote", saleModel.canAddToCart && saleModel.showQuote);
check("buy-online supports cart", regularModel.canAddToCart && !regularModel.showQuote);
check("in-stock customer wording", regularModel.availability === "In stock");
check("low-stock customer wording", createOfferDisplayModel(moq, now).availability === "Low stock");
check("out-of-stock disables cart", !createOfferDisplayModel(outOfStock, now).canAddToCart && createOfferDisplayModel(outOfStock, now).availability === "Out of stock");
check("on-enquiry disables cart", !createOfferDisplayModel(quoteOnly, now).canAddToCart && createOfferDisplayModel(quoteOnly, now).availability === "Availability on enquiry");
check("MOQ exposed", createOfferDisplayModel(moq, now).minimum === 4);
check("maximum exposed", createOfferDisplayModel(moq, now).maximum === 8);
check("multiple offers supported", storefrontTestOffers.length === 5);
check("offer switching changes presentation", regularModel.price !== saleModel.price && regularModel.offerId !== saleModel.offerId);
check("private price produces professional alternative", createOfferDisplayModel({ ...regular, priceVisibility: "quote-only" }, now).price === undefined);

let cart = addCartLine({ lines: [] }, { offerId: regular.id, quantity: 1 });
check("cart add", cart.lines.length === 1);
cart = addCartLine(cart, { offerId: regular.id, quantity: 1 });
check("same item merges", cart.lines[0].quantity === 2);
cart = updateCartQuantity(cart, regular.id, 3); check("quantity increase", cart.lines[0].quantity === 3);
cart = updateCartQuantity(cart, regular.id, 2); check("quantity decrease", cart.lines[0].quantity === 2);
cart = updateCartQuantity(cart, regular.id, 5); check("manual quantity", cart.lines[0].quantity === 5);
check("MOQ server enforcement", resolveCart({ lines: [{ offerId: moq.id, quantity: 2 }] }, storefrontTestOffers, options).issues[0].code === "below-minimum");
check("max server enforcement", resolveCart({ lines: [{ offerId: regular.id, quantity: 13 }] }, storefrontTestOffers, options).issues[0].code === "above-maximum");
cart = removeCartLine(cart, regular.id); check("remove item", cart.lines.length === 0);
const persisted = serializeCart({ lines: [{ offerId: sale.id, quantity: 2 }] });
check("reload persistence stores identifiers only", parseStoredCart(persisted).lines[0].offerId === sale.id && !persisted.includes("price"));
check("corrupted storage becomes empty", parseStoredCart("{broken").lines.length === 0);
check("removed offer handled", resolveCart({ lines: [{ offerId: "removed", quantity: 1 }] }, storefrontTestOffers, options).issues[0].code === "offer-not-found");
const oldLine = resolveCart({ lines: [{ offerId: regular.id, quantity: 1 }] }, storefrontTestOffers, options).lines;
const newLine = resolveCart({ lines: [{ offerId: regular.id, quantity: 1 }] }, [{ ...regular, regularPriceMinor: 275_000 }], options).lines;
check("price change detected", detectPriceUpdates(oldLine, newLine)[0] === regular.id);
check("promotion expiry revalidates current price", resolveCart({ lines: [{ offerId: sale.id, quantity: 1 }] }, [{ ...sale, saleEnd: "2026-01-02" }], options).lines[0].unitPriceMinor === sale.regularPriceMinor);
check("stock change handled", resolveCart({ lines: [{ offerId: regular.id, quantity: 1 }] }, [{ ...regular, stockQuantity: 0 }], options).issues[0].code === "insufficient-stock");
check("quote-only cannot add", resolveCart({ lines: [{ offerId: quoteOnly.id, quantity: 1 }] }, storefrontTestOffers, options).issues[0].code === "offer-not-buyable");
check("commerce flag off", resolveCart({ lines: [{ offerId: regular.id, quantity: 1 }] }, storefrontTestOffers, { ...options, commerceEnabled: false }).issues[0].code === "commerce-disabled");
check("cart count uses total units", countCartUnits({ lines: [{ offerId: regular.id, quantity: 2 }, { offerId: sale.id, quantity: 3 }] }) === 5);

const records=[]; const repository={async findByIdempotencyKey(key){return records.find((record)=>record.idempotencyKey===key)??null;},async create(order){const stored={...order,id:`test-${records.length+1}`};records.push(stored);return stored;}};
const checkout={fullName:"Synthetic Test Customer",phone:"+254700000000",email:"test@example.invalid",deliveryLocation:"Synthetic Test Town"};
const orderInput={cart:{lines:[{offerId:regular.id,quantity:2}]},checkout,idempotencyKey:"phase25e-checkout-0001"};
const deps={offers:storefrontTestOffers,resolution:options,repository,now,createReference:()=>"ORD-TEST-PREVIEW"};
const order=await createOrderDraft(orderInput,deps);
check("valid synthetic checkout", order.lines.length === 1);
for (const [label, override] of [["invalid name",{fullName:""}],["invalid phone",{phone:"x"}],["invalid email",{email:"broken"}],["missing location",{deliveryLocation:""}]]) {
  let rejected=false; try{await createOrderDraft({...orderInput,checkout:{...checkout,...override},idempotencyKey:`phase25e-${label.replaceAll(" ","-")}-0001`},deps);}catch{rejected=true;} check(label,rejected);
}
let cartChanged=false; try{await createOrderDraft({...orderInput,cart:{lines:[{offerId:"removed",quantity:1}]},idempotencyKey:"phase25e-cart-changed"},deps);}catch{cartChanged=true;} check("cart changed during checkout rejected",cartChanged);
const changedOrder=await createOrderDraft({...orderInput,idempotencyKey:"phase25e-price-changed"},{...deps,offers:[{...regular,regularPriceMinor:275_000}]}); check("checkout uses changed price",changedOrder.totals.grandTotalMinor===550_000);
let stockRejected=false;try{await createOrderDraft({...orderInput,idempotencyKey:"phase25e-stock-changed"},{...deps,offers:[{...regular,stockQuantity:0}]});}catch{stockRejected=true;}check("out of stock at checkout rejected",stockRejected);
check("order created",order.referenceNumber==="ORD-TEST-PREVIEW");
const duplicate=await createOrderDraft(orderInput,deps);check("idempotent resubmit",duplicate.id===order.id&&records.filter((item)=>item.idempotencyKey===order.idempotencyKey).length===1);
check("payment remains unpaid",order.paymentStatus==="unpaid");
const malicious=await createOrderDraft({cart:{lines:[{offerId:regular.id,quantity:1,unitPriceMinor:1}]},checkout,idempotencyKey:"phase25e-malicious-price"},deps);check("browser price has no authority",malicious.totals.grandTotalMinor===regular.regularPriceMinor);

const productSource=readFileSync(path.join(root,"src/components/commerce/product-commerce-panel.tsx"),"utf8");
const cartSource=readFileSync(path.join(root,"src/components/commerce/cart-page.tsx"),"utf8");
const checkoutSource=readFileSync(path.join(root,"src/components/commerce/checkout-page.tsx"),"utf8");
const cartRoute=readFileSync(path.join(root,"src/app/(website)/cart/page.tsx"),"utf8");
check("offer selector is labelled",productSource.includes('role="radiogroup"')&&productSource.includes('role="radio"'));
check("cart announcements are live",productSource.includes('aria-live="polite"')&&cartSource.includes('aria-live="polite"'));
check("checkout labels and errors are accessible",checkoutSource.includes('role="alert"')&&checkoutSource.includes("Full Name *"));
check("cart route is test-gated",cartRoute.includes("isStorefrontTestMode")&&cartRoute.includes("notFound"));
check("real commerce remains disabled",siteConfig.commerceEnabled===false);
console.info(`Storefront validation complete: ${passed}/${passed} checks passed.`);
