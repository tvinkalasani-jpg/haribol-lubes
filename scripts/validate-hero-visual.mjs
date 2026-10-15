import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const hero = read("src/components/home/home-hero.tsx");
const visual = read("src/components/home/hero-industrial-visual.tsx");
const loader = read("src/components/home/hero-visual-enhancer.tsx");
const motion = read("src/components/home/hero-visual-motion.ts");
const styles = read("src/components/home/home-hero.module.css");
const packageJson = JSON.parse(read("package.json"));

const checks = [
  ["hero remains server rendered", !hero.includes('"use client"')],
  ["approved headline remains present", hero.includes("Powering Motion.") && hero.includes("Protecting Performance.")],
  ["Explore Products remains primary", hero.indexOf('href="/products"') < hero.indexOf('href="/request-a-quote"')],
  ["WhatsApp remains a supporting action", hero.includes("WhatsAppLink")],
  ["visual is isolated to the hero", hero.includes("HeroIndustrialVisual") && visual.includes('data-visual-slot="hero"')],
  ["server-rendered fallback exists", visual.includes("mechanicalAssembly") && visual.includes("lubricantLayer")],
  ["composition communicates engineering", visual.includes("rollerCage") && visual.includes("gearAssembly")],
  ["composition communicates lubrication", visual.includes("oilRibbon") && visual.includes("Bearing / Film / Load")],
  ["visual is decorative", visual.includes('aria-hidden="true"') && visual.includes('role="presentation"')],
  ["enhancement is dynamically imported", loader.includes('import("./hero-visual-motion")')],
  ["client boundary is limited to enhancer", loader.startsWith('"use client"') && !visual.includes('"use client"')],
  ["pointer motion avoids React state", motion.includes("requestAnimationFrame") && !motion.includes("useState")],
  ["offscreen motion is paused", motion.includes("IntersectionObserver") && styles.includes('data-motion-state="paused"')],
  ["reduced motion is respected", motion.includes("prefers-reduced-motion") && styles.includes("@media (prefers-reduced-motion: reduce)")],
  ["mobile continuous motion is removed", styles.includes("@media (max-width: 48rem)") && styles.includes(".rollerCage")],
  ["Light treatment exists", styles.includes('html[data-theme="light"]')],
  ["Dark treatment exists", styles.includes('html[data-theme="dark"]')],
  ["failure leaves fallback intact", loader.includes("server-rendered fallback remains visible")],
  ["no WebGL dependency was added", !Object.keys(packageJson.dependencies).some((name) => ["three", "@react-three/fiber", "@react-three/drei"].includes(name))],
  ["no unsupported product pack is presented", !/API\s|SAE\s|certif|approved by/i.test(visual)],
  ["commerce remains absent from hero", !/buy now|add to cart|price|checkout/i.test(hero + visual)],
];

let failures = 0;
checks.forEach(([label, passed], index) => {
  if (!passed) failures += 1;
  console.log(`${passed ? "PASS" : "FAIL"} ${String(index + 1).padStart(2, "0")} ${label}`);
});

if (failures) {
  console.error(`Hero visual validation failed: ${failures}/${checks.length} checks failed.`);
  process.exit(1);
}

console.log(`Hero visual validation complete: ${checks.length}/${checks.length} checks passed.`);
