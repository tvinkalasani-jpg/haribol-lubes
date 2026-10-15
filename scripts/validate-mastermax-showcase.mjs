import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const data = read("src/data/mastermax-catalogue.ts");
const brands = read("src/data/brands.ts");
const showcase = read("src/components/home/mastermax-showcase.tsx");
const visual = read("src/components/home/mastermax-family-visual.tsx");
const styles = read("src/components/home/mastermax-showcase.module.css");
const packageJson = JSON.parse(read("package.json"));

const groups = ["engine", "hydraulic", "transmission", "compressor", "industrial", "greases"];
const routes = [
  "/products/engine-oils",
  "/products/hydraulic-oils",
  "/products/transmission-gear-oils",
  "/products/compressor-oils",
  "/products/industrial-lubricants",
  "/products/greases",
];
const combinedUi = `${showcase}\n${visual}`;

const checks = [
  ["all six catalogue groups remain present", groups.every((id) => data.includes(`id: "${id}"`))],
  ["all catalogue routes remain available", routes.every((route) => data.includes(`futureHref: "${route}"`))],
  ["showcase reads the shared catalogue taxonomy", showcase.includes("mastermaxCatalogueTaxonomy.map")],
  ["brand copy reads the shared brand record", showcase.includes("mastermaxBrand.shortDescription")],
  ["verified ownership wording is exact", showcase.includes("Mastermax is an owned brand of Haribol Lubes Limited.")],
  ["brand record remains active, featured and owned", ['status: "active"', "featured: true", 'brandType: "owned"'].every((value) => brands.includes(value))],
  ["section remains a server component", !combinedUi.includes('"use client"') && !combinedUi.includes("useState") && !combinedUi.includes("useEffect")],
  ["family visual uses catalogue image records", visual.includes("mastermaxCatalogueTaxonomy.slice(0, 4)") && visual.includes("src={group.image.src}")],
  ["family visual is accessible", visual.includes("<figcaption") && visual.includes('alt=""') && visual.includes('aria-hidden="true"')],
  ["technical SVG is decorative", visual.includes('aria-hidden="true"') && visual.includes('focusable="false"')],
  ["Explore Mastermax route is intact", showcase.includes("href={mastermaxBrand.futureHref}")],
  ["Request Quote route is intact", showcase.includes('href="/request-a-quote?source=mastermax-showcase"')],
  ["group selector uses native radio controls", showcase.includes('type="radio"') && showcase.includes("<fieldset") && showcase.includes("<legend>")],
  ["product groups use semantic headings", showcase.includes("<h3>") && showcase.includes("<h4")],
  ["focus treatment is explicit", styles.includes(":has(input:focus-visible)") && styles.includes(".rangeLink:focus-visible")],
  ["Light and Dark visual treatments exist", styles.includes(':global([data-theme="dark"]) .section')],
  ["mobile layouts are defined", styles.includes("@media (max-width: 42rem)") && styles.includes("@media (max-width: 22rem)")],
  ["coarse pointers avoid decorative transitions", styles.includes("@media (hover: none), (pointer: coarse)")],
  ["reduced motion is supported", styles.includes("@media (prefers-reduced-motion: reduce)")],
  ["motion has no infinite loop", !/animation[^;]*infinite/i.test(styles)],
  ["mobile selector does not use horizontal scrolling", !/overflow-x\s*:\s*(auto|scroll)/i.test(styles)],
  ["no commerce interface was introduced", !/buy now|add to cart|checkout|sale badge|price:/i.test(combinedUi)],
  ["no unsupported superlative or certification claim appears", !/number one|market leader|award-winning|certified by|best lubricant/i.test(combinedUi)],
  ["no heavy visual dependency is installed", !Object.keys(packageJson.dependencies).some((name) => ["three", "@react-three/fiber", "@react-three/drei", "pixi.js", "gsap"].includes(name))],
];

let failures = 0;
checks.forEach(([label, passed], index) => {
  if (!passed) failures += 1;
  console.log(`${passed ? "PASS" : "FAIL"} ${String(index + 1).padStart(2, "0")} ${label}`);
});

if (failures) {
  console.error(`Mastermax showcase validation failed: ${failures}/${checks.length} checks failed.`);
  process.exit(1);
}

console.log(`Mastermax showcase validation complete: ${checks.length}/${checks.length} checks passed.`);
