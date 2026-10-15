import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const input = process.argv[2];
const output = process.argv[3] || "src/data/kenya-map.ts";

if (!input) throw new Error("Provide the Natural Earth countries GeoJSON path.");

const collection = JSON.parse(await readFile(resolve(input), "utf8"));
const kenya = collection.features.find((feature) => feature.properties?.ADM0_A3 === "KEN");
if (!kenya || kenya.geometry.type !== "MultiPolygon") throw new Error("Kenya MultiPolygon was not found.");

const polygons = kenya.geometry.coordinates;
const points = polygons.flat(2);
const longitudes = points.map(([longitude]) => longitude);
const latitudes = points.map(([, latitude]) => latitude);
const bounds = {
  west: Math.min(...longitudes), east: Math.max(...longitudes),
  south: Math.min(...latitudes), north: Math.max(...latitudes),
};
const viewBox = { width: 600, height: 720, inset: 50 };

function project([longitude, latitude]) {
  const x = viewBox.inset + ((longitude - bounds.west) / (bounds.east - bounds.west)) * (viewBox.width - viewBox.inset * 2);
  const y = viewBox.inset + ((bounds.north - latitude) / (bounds.north - bounds.south)) * (viewBox.height - viewBox.inset * 2);
  return [x, y];
}

function perpendicularDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (dx === 0 && dy === 0) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point[0] - (start[0] + t * dx), point[1] - (start[1] + t * dy));
}

function simplify(pointsToSimplify, tolerance) {
  if (pointsToSimplify.length <= 2) return pointsToSimplify;
  let maximum = 0;
  let split = 0;
  for (let index = 1; index < pointsToSimplify.length - 1; index += 1) {
    const distance = perpendicularDistance(pointsToSimplify[index], pointsToSimplify[0], pointsToSimplify.at(-1));
    if (distance > maximum) { maximum = distance; split = index; }
  }
  if (maximum <= tolerance) return [pointsToSimplify[0], pointsToSimplify.at(-1)];
  return [...simplify(pointsToSimplify.slice(0, split + 1), tolerance).slice(0, -1), ...simplify(pointsToSimplify.slice(split), tolerance)];
}

const format = (value) => Number(value.toFixed(2));
const path = polygons.flatMap((polygon) => polygon).map((ring) => {
  const projected = ring.map(project);
  const simplified = simplify(projected, 0.8);
  return `${simplified.map(([x, y], index) => `${index === 0 ? "M" : "L"}${format(x)} ${format(y)}`).join(" ")} Z`;
}).join(" ");

const outputSource = `// Generated from Natural Earth Admin 0 Countries (public domain).\n// Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries.geojson\n\nexport const kenyaMapData = ${JSON.stringify({ viewBox, bounds, path }, null, 2)} as const;\n\nexport const kenyaLocationReferences = {\n  nairobi: { name: "Nairobi", role: "Nearby reference city", latitude: -1.2802, longitude: 36.8346 },\n  mlolongo: { name: "Mlolongo", role: "Operating base", latitude: -1.39465, longitude: 36.94336 },\n} as const;\n`;

await writeFile(resolve(output), outputSource);
console.log(`Wrote ${output} with ${path.length} path characters.`);
