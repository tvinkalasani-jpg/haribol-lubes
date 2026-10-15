import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");
const component = read("src/components/home/kenya-presence.tsx");
const styles = read("src/components/home/kenya-presence.module.css");
const data = read("src/data/kenya-map.ts");
const config = read("src/config/site.ts");
const documentation = read("docs/kenya-location-experience.md");
const packageJson = JSON.parse(read("package.json"));

const checks = [
  ["accurate country outline is present", /"path": "M/.test(data) && (data.match(/ L/g) || []).length > 120],
  ["outline source is Natural Earth", data.includes("Natural Earth Admin 0 Countries") && documentation.includes("Natural Earth")],
  ["public-domain source is documented", documentation.includes("public domain")],
  ["Mlolongo source coordinates are fixed", data.includes("latitude: -1.39465") && data.includes("longitude: 36.94336")],
  ["Nairobi source coordinates are fixed", data.includes("latitude: -1.2802") && data.includes("longitude: 36.8346")],
  ["Mlolongo is the primary operating base", component.includes("Mlolongo · operating base") && component.includes("Primary location")],
  ["Nairobi is reference only", component.includes("Nairobi · nearby reference city") && component.includes("Nearby reference")],
  ["no Nairobi business-location claim", !/based in Nairobi|operat(?:es|ing) from Nairobi|Nairobi branch|Nairobi address/i.test(component)],
  ["verified address remains configuration-driven", ["businessAddress.venue", "businessAddress.street", "businessAddress.locality", "businessAddress.country"].every((field) => component.includes(field))],
  ["verified address remains unchanged", config.includes('venue: "Emerald Business Park"') && config.includes('street: "Kutch Rd"') && config.includes('locality: "Mlolongo"')],
  ["verified Maps URL remains configuration-driven", component.includes("siteConfig.businessAddress.mapsUrl")],
  ["Maps link is safely external", component.includes('target="_blank"') && component.includes('rel="noopener noreferrer"')],
  ["map is supplementary to real text", component.includes('aria-hidden="true"') && component.includes("<address>") && component.includes("<figcaption")],
  ["section remains server rendered", !component.includes('"use client"') && !/useState|useEffect/.test(component)],
  ["Light and Dark treatments exist", styles.includes(':global([data-theme="dark"]) .section')],
  ["reduced motion is supported", styles.includes("@media (prefers-reduced-motion: reduce)")],
  ["coarse pointer motion is removed", styles.includes("@media (hover: none), (pointer: coarse)")],
  ["mobile layout is explicit", styles.includes("@media (max-width: 48rem)") && styles.includes("grid-template-columns: 1fr")],
  ["no external map runtime is installed", !Object.keys(packageJson.dependencies).some((name) => /mapbox|leaflet|openlayers|google-map/i.test(name))],
  ["no external tiles or map iframe are loaded", !/iframe|tile\.openstreetmap|maps\.googleapis|mapbox\.com/i.test(component)],
  ["no unsupported geographic claims appear", !/nationwide delivery|East Africa coverage|branch network|warehouse|same-day delivery/i.test(component)],
  ["commerce remains absent", !/buy now|add to cart|checkout|price/i.test(component)],
  ["country and local plots are both present", component.includes("projectToKenya") && component.includes("projectToLocalPlot")],
  ["source attribution is visible", component.includes("© OpenStreetMap contributors") && component.includes("Country boundary: Natural Earth")],
];

let failures = 0;
checks.forEach(([label, passed], index) => {
  if (!passed) failures += 1;
  console.log(`${passed ? "PASS" : "FAIL"} ${String(index + 1).padStart(2, "0")} ${label}`);
});
if (failures) {
  console.error(`Kenya location validation failed: ${failures}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`Kenya location validation complete: ${checks.length}/${checks.length} checks passed.`);
