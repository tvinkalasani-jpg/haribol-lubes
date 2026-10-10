import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const origin = (process.env.SEO_TEST_ORIGIN || "http://localhost:3027").replace(/\/$/, "");
const productionOrigin = "https://haribollubesltd.co.ke";
const outputDirectory = resolve(process.cwd(), process.env.SEO_OUTPUT_DIR || "../outputs/phase-27");
const queue = ["/"];
const seen = new Set();
const pages = [];
const redirects = [];
const brokenLinks = [];
const canonicalErrors = [];
const schemaErrors = [];
const skippedPrefixes = ["/api/", "/admin", "/_next/", "/icon.svg"];

const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
const match = (html, expression) => decode(html.match(expression)?.[1]?.trim() || "");
const normalizePath = (href) => {
  try {
    const url = new URL(href, origin);
    if (url.origin !== origin && url.origin !== productionOrigin) return null;
    if (skippedPrefixes.some((prefix) => url.pathname.startsWith(prefix))) return null;
    return `${url.pathname}${url.search}`;
  } catch { return null; }
};
const comparableUrl = (value) => value === `${productionOrigin}/` ? productionOrigin : value.replace(/\/$/, "");

async function fetchManual(path) {
  return fetch(`${origin}${path}`, { redirect: "manual", headers: { "user-agent": "HaribolTechnicalSeoAudit/1.0" } });
}

while (queue.length) {
  const path = queue.shift();
  if (!path || seen.has(path) || seen.size >= 200) continue;
  seen.add(path);
  const response = await fetchManual(path);
  if (response.status >= 300 && response.status < 400) {
    redirects.push({ path, status: response.status, location: response.headers.get("location") });
    continue;
  }
  const html = await response.text();
  if (response.status >= 400) { brokenLinks.push({ path, status: response.status }); continue; }
  if (!(response.headers.get("content-type") || "").includes("text/html")) continue;

  const title = match(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = match(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || match(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const canonical = match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || match(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const robots = match(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)
    || match(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i);
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
  const schemas = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const schema of schemas) {
    try { JSON.parse(decode(schema[1] || "")); } catch (error) { schemaErrors.push({ path, error: String(error) }); }
  }
  const cleanPath = path.split(/[?#]/)[0] || "/";
  const expectedCanonical = new URL(cleanPath === "/" ? "/" : cleanPath.replace(/\/$/, ""), productionOrigin).toString();
  if (comparableUrl(canonical) !== comparableUrl(expectedCanonical)) canonicalErrors.push({ path, canonical, expected: expectedCanonical });
  if (canonical.includes("localhost")) canonicalErrors.push({ path, canonical, error: "localhost canonical" });
  pages.push({ path, status: response.status, title, description, canonical, robots, h1Count, schemaCount: schemas.length });

  for (const hrefMatch of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
    const nextPath = normalizePath(decode(hrefMatch[1] || ""));
    if (nextPath && !seen.has(nextPath)) queue.push(nextPath);
  }
}

const internalRedirects = redirects.length;
for (const path of ["/products/gear-oils", "/products/transmission-fluids"]) {
  if (redirects.some((entry) => entry.path === path)) continue;
  const response = await fetchManual(path);
  redirects.push({ path, status: response.status, location: response.headers.get("location") });
}

const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
const sitemapXml = await sitemapResponse.text();
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((entry) => decode(entry[1] || ""));
const sitemapChecks = [];
for (const url of sitemapUrls) {
  const path = new URL(url).pathname;
  const response = await fetchManual(path);
  const html = await response.text();
  const canonical = match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || match(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const robots = match(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i) || match(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i);
  sitemapChecks.push({ url, status: response.status, canonical, robots, location: response.headers.get("location") });
}

const indexable = pages.filter((page) => !page.robots.toLowerCase().includes("noindex"));
const duplicates = (key) => [...new Map(indexable.filter((page) => page[key]).map((page) => [page[key], indexable.filter((candidate) => candidate[key] === page[key]).map((candidate) => candidate.path)]).filter(([, paths]) => paths.length > 1)).entries()].map(([value, paths]) => ({ value, paths }));
const duplicateTitles = duplicates("title");
const duplicateDescriptions = duplicates("description");
const report = {
  generatedAt: new Date().toISOString(), origin, productionOrigin,
  summary: { crawled: pages.length + redirects.length + brokenLinks.length, html200: pages.filter((page) => page.status === 200).length, redirects: redirects.length, internalRedirects, notFound: brokenLinks.filter((entry) => entry.status === 404).length, noindex: pages.filter((page) => page.robots.toLowerCase().includes("noindex")).length, indexable: indexable.length, brokenLinks: brokenLinks.length, canonicalErrors: canonicalErrors.length, schemaErrors: schemaErrors.length, sitemapUrls: sitemapUrls.length, duplicateTitles: duplicateTitles.length, duplicateDescriptions: duplicateDescriptions.length, headingErrors: pages.filter((page) => page.h1Count !== 1).length },
  pages, redirects, brokenLinks, canonicalErrors, schemaErrors, duplicateTitles, duplicateDescriptions,
  headingErrors: pages.filter((page) => page.h1Count !== 1).map(({ path, h1Count }) => ({ path, h1Count })), sitemapChecks,
};
await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, "crawl-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));

const invalidSitemap = sitemapChecks.filter((entry) => entry.status !== 200 || entry.location || comparableUrl(entry.canonical) !== comparableUrl(entry.url) || entry.robots.toLowerCase().includes("noindex") || !entry.url.startsWith(productionOrigin));
if (brokenLinks.length || canonicalErrors.length || schemaErrors.length || duplicateTitles.length || duplicateDescriptions.length || report.headingErrors.length || invalidSitemap.length) {
  console.error(JSON.stringify({ brokenLinks, canonicalErrors, schemaErrors, duplicateTitles, duplicateDescriptions, headingErrors: report.headingErrors, invalidSitemap }, null, 2));
  process.exitCode = 1;
}
