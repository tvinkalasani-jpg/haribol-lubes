import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const data = read("src/data/product-categories.ts");
const section = read("src/components/home/product-categories.tsx");
const artwork = read("src/components/home/category-artwork.tsx");
const styles = read("src/components/home/product-categories.module.css");
const packageJson = JSON.parse(read("package.json"));

const categories = [
  ["Engine Oils", "/products/engine-oils", "engine"],
  ["Gear Oils", "/products/transmission-gear-oils", "gear"],
  ["Transmission Fluids", "/products/transmission-gear-oils", "transmission"],
  ["Hydraulic Oils", "/products/hydraulic-oils", "hydraulic"],
  ["Industrial Lubricants", "/products/industrial-lubricants", "industrial"],
  ["Greases", "/products/greases", "grease"],
  ["Specialty Fluids", "/products/specialty-fluids", "specialty"],
];

const checks = [
  ["all seven approved categories remain present", categories.every(([name]) => data.includes(`name: "${name}"`))],
  ["all approved routes remain unchanged", categories.every(([, href]) => data.includes(`href: "${href}"`))],
  ["all seven visual concepts remain data driven", categories.every(([, , visual]) => data.includes(`visual: "${visual}"`))],
  ["section remains a server component", !section.includes('"use client"') && !artwork.includes('"use client"')],
  ["complete SVG fallback renders on the server", artwork.includes("<svg") && artwork.includes("data-category-artwork")],
  ["artwork is decorative", artwork.includes('role="presentation"') && artwork.includes('focusable="false"')],
  ["category names remain real headings", section.includes("<h3>{category.name}</h3>")],
  ["panels remain semantic links", section.includes('<a className={styles.card} href={category.href}>')],
  ["visible category affordance exists", section.includes("Explore category")],
  ["focus treatment is explicit", styles.includes(".card:focus-visible") && styles.includes("outline: 3px")],
  ["each category has distinct mechanical response", [".engine", ".gear", ".transmission", ".hydraulic", ".industrial", ".grease", ".specialty"].every((selector) => styles.includes(`${selector} .card`))],
  ["fluid-path response is restrained", styles.includes("stroke-dashoffset") && !styles.includes("infinite")],
  ["mobile coarse pointers are static", styles.includes("@media (hover: none), (pointer: coarse)")],
  ["reduced motion is supported", styles.includes("@media (prefers-reduced-motion: reduce)")],
  ["Light and Dark treatments exist", styles.includes('data-theme="dark"') && styles.includes("--art-line")],
  ["editorial scale variation remains", styles.includes("grid-column: span 7") && styles.includes("grid-column: span 12")],
  ["no fabricated product specifications", !/SAE\s|API\s[A-Z]|ACEA|certif|approved by/i.test(artwork)],
  ["no product pack is fabricated", !/container|bottle|drum|label/i.test(artwork)],
  ["no commerce UI is introduced", !/buy now|add to cart|price|checkout|sale badge/i.test(section + artwork)],
  ["no heavy visual dependency is installed", !Object.keys(packageJson.dependencies).some((name) => ["three", "@react-three/fiber", "@react-three/drei", "pixi.js"].includes(name))],
];

let failures = 0;
checks.forEach(([label, passed], index) => {
  if (!passed) failures += 1;
  console.log(`${passed ? "PASS" : "FAIL"} ${String(index + 1).padStart(2, "0")} ${label}`);
});

if (failures) {
  console.error(`Category visual validation failed: ${failures}/${checks.length} checks failed.`);
  process.exit(1);
}

console.log(`Category visual validation complete: ${checks.length}/${checks.length} checks passed.`);
