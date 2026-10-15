import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [header, controller, styles, navigation, theme, whatsapp, types] = await Promise.all([
  read("src/components/layout/site-header.tsx"),
  read("src/components/layout/header-controller.tsx"),
  read("src/components/layout/site-header.module.css"),
  read("src/data/site-navigation.ts"),
  read("src/components/ui/theme-control.tsx"),
  read("src/components/ui/whatsapp-link.tsx"),
  read("src/types/whatsapp.ts"),
]);

const tests = [];
const test = (name, run) => tests.push([name, run]);

test("01 approved desktop primary labels are present", () => {
  for (const label of ["Industries", "Product Finder", "Resources", "About"]) {
    assert.match(navigation, new RegExp(`label: "${label}"`));
  }
});
test("02 Applications is no longer primary", () => assert.doesNotMatch(navigation.match(/primaryNavigation = \[[\s\S]*?\] as const/)?.[0] ?? "", /Applications/));
test("03 Insights is no longer primary", () => assert.doesNotMatch(navigation.match(/primaryNavigation = \[[\s\S]*?\] as const/)?.[0] ?? "", /Insights/));
test("04 Product Finder uses its canonical route", () => assert.match(navigation, /href: "\/product-finder", label: "Product Finder"/));
test("05 Products retains an accessible disclosure", () => { assert.match(header, /aria-controls=\{productsMenuId\}/); assert.match(header, /data-products-trigger/); });
test("06 desktop Products menu exposes state", () => { assert.match(header, /data-products-panel/); assert.match(controller, /setProductsOpen/); });
test("07 header uses the typographic company wordmark", () => { assert.match(header, />Haribol</); assert.match(header, />Lubes Limited</); });
test("08 quote is the primary desktop action", () => assert.match(header, /styles\.quoteAction[\s\S]*?href="\/request-a-quote"/));
test("09 quote remains in the mobile action group", () => assert.match(header, /styles\.mobileActions[\s\S]*?href="\/request-a-quote"/));
test("10 desktop theme control remains present", () => assert.match(header, /placement="desktop"/));
test("11 mobile theme control remains present", () => assert.match(header, /placement="mobile"/));
test("12 theme control keeps visible Light and Dark labels", () => { assert.match(theme, /light: "Light"/); assert.match(theme, /dark: "Dark"/); });
test("13 no System mode is introduced", () => assert.doesNotMatch(theme, /System/));
test("14 desktop WhatsApp uses the shared component", () => assert.match(header, /className=\{styles\.whatsappLink\}[\s\S]*?source="header"/));
test("15 mobile WhatsApp uses the shared component", () => assert.match(header, /className=\{styles\.mobileWhatsApp\}[\s\S]*?source="header"/));
test("16 shared WhatsApp link keeps safe external-link attributes", () => { assert.match(whatsapp, /rel="noopener noreferrer"/); assert.match(whatsapp, /target="_blank"/); });
test("17 header is an approved analytics source", () => assert.match(types, /"header"/));
test("18 mobile trigger exposes controls and expanded state", () => { assert.match(header, /aria-controls=\{mobileMenuId\}/); assert.match(header, /aria-expanded="false"/); });
test("19 mobile panel is a labelled modal dialog", () => { assert.match(header, /aria-label="Mobile navigation"/); assert.match(header, /aria-modal="true"/); assert.match(header, /role="dialog"/); });
test("20 hidden mobile panel starts inert", () => assert.match(header, /id=\{mobileMenuId\}\s+inert/));
test("21 controller synchronizes panel inert state", () => assert.match(controller, /mobilePanel\.toggleAttribute\("inert", !open\)/));
test("22 controller locks page scroll while open", () => assert.match(controller, /document\.body\.style\.overflow = "hidden"/));
test("23 controller restores page scroll", () => assert.match(controller, /document\.body\.style\.overflow = ""/));
test("24 mobile menu supports Escape", () => assert.match(controller, /event\.key === "Escape"/));
test("25 mobile menu manages Tab focus", () => assert.match(controller, /event\.key !== "Tab"/));
test("26 closing returns focus to trigger", () => assert.match(controller, /mobileTrigger\.focus\(\)/));
test("27 breakpoint change closes an obsolete mobile overlay", () => { assert.match(controller, /desktopMediaQuery\.addEventListener\("change"/); assert.match(controller, /handleDesktopMediaChange/); });
test("28 current direct route receives aria-current", () => assert.match(controller, /setAttribute\("aria-current", "page"\)/));
test("29 section descendants can retain current state", () => assert.match(controller, /data-nav-section/));
test("30 product routes activate Products", () => assert.match(controller, /currentPath\.startsWith\("\/products\/"\)/));
test("31 top and scrolled header states are distinct", () => { assert.match(styles, /min-height: 5rem/); assert.match(styles, /data-scrolled[\s\S]*?min-height: var\(--header-height\)/); });
test("32 scrolled state uses the solid semantic surface", () => assert.match(styles, /--header-background: var\(--color-header-background-solid\)/));
test("33 backdrop blur remains restrained", () => assert.match(styles, /blur\(10px\)/));
test("34 smaller laptops use the deliberate menu layout", () => assert.match(styles, /@media \(max-width: 82rem\)/));
test("35 narrow mobile layout is explicit", () => assert.match(styles, /@media \(max-width: 47\.999rem\)/));
test("36 320-class layout is explicit", () => assert.match(styles, /@media \(max-width: 23rem\)/));
test("37 mobile targets meet the 44px baseline", () => assert.match(styles, /min-height: 3\.85rem/));
test("38 mobile hierarchy includes ordered primary links", () => assert.match(header, /0\{index \+ 2\}/));
test("39 mobile utility area retains Contact", () => assert.match(header, /data-nav-link href="\/contact"/));
test("40 reduced motion disables header transitions", () => assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/));
test("41 unsupported blur has an opaque fallback", () => assert.match(styles, /@supports not \(backdrop-filter: blur\(1px\)\)/));
test("42 header contains no commerce action", () => assert.doesNotMatch(header, /cart|checkout|buy now|add to cart/i));
test("43 mobile utility displays the verified Mlolongo locality", () => { assert.match(header, /siteConfig\.businessAddress\.locality/); assert.match(header, /siteConfig\.businessAddress\.country/); });
test("44 header does not identify Nairobi as the business location", () => assert.doesNotMatch(header, /nairobi/i));

let passed = 0;
for (const [name, run] of tests) {
  await run();
  console.log(`PASS ${name}`);
  passed += 1;
}
console.log(`Header/navigation validation complete: ${passed}/${tests.length} checks passed.`);
