import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
execFileSync(process.execPath, [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.cms-tests.json"], { cwd: root, stdio: "inherit" });
const require = createRequire(import.meta.url);
const build = path.join(root, ".cms-test-build");
writeFileSync(path.join(build, "package.json"), '{"type":"commonjs"}\n');
const { brands } = require(path.join(build, "data/brands.js"));
const { applications } = require(path.join(build, "data/catalogue/applications.js"));
const { catalogueCategories } = require(path.join(build, "data/catalogue/categories.js"));
const { markets } = require(path.join(build, "data/catalogue/markets.js"));
const { products } = require(path.join(build, "data/catalogue/products.js"));
const { specifications } = require(path.join(build, "data/catalogue/specifications.js"));
const { mapCmsCatalogue } = require(path.join(build, "features/catalogue/cms-domain-mapper.js"));

let nextId = 1;
const relation = (slug) => ({ id: nextId++, slug });
const productDocs = products.map((product) => ({ ...product, id: nextId++, brand: relation(product.brandId), primaryCategory: relation(product.primaryCategoryId), secondaryCategories: (product.secondaryCategoryIds || []).map(relation), applications: product.applicationIds.map(relation), industrySlugs: product.industryIds, specifications: product.specificationIds.map(relation), markets: product.markets.map((entry) => relation(entry.marketId)), lubricantType: product.lubricantType?.value, baseOilType: product.baseOilType?.value, seo: { metaTitle: product.seo.title, metaDescription: product.seo.description, indexable: product.seo.indexable } }));
const variantDocs = products.flatMap((product) => product.variants.map((variant) => ({ ...variant, id: nextId++, slug: variant.id, product: relation(product.slug), viscosityGrade: variant.viscosityGrade?.value, specifications: (variant.specificationIds || []).map(relation), markets: variant.marketIds.map(relation) })));
const mapped = mapCmsCatalogue({ brands: brands.map((record) => ({ ...record, id: nextId++, accent: record.brandAccent, verificationStatus: "catalogue-derived" })), categories: catalogueCategories.map((record) => ({ ...record, id: nextId++, parent: record.parentCategoryId ? relation(record.parentCategoryId) : null, publicationStatus: "draft", seo: { indexable: false } })), applications: applications.map((record) => ({ ...record, id: nextId++ })), specifications: specifications.map((record) => ({ ...record, id: nextId++, slug: record.id, classificationType: record.kind === "performance-standard" ? "api-performance" : record.code.includes("GL-") ? "gl" : "technical-classification" })), markets: markets.map((record) => ({ ...record, id: nextId++ })), products: productDocs, variants: variantDocs });

const checks = [
  ["10 products", mapped.products.length === 10], ["21 variants", mapped.products.reduce((sum, product) => sum + product.variants.length, 0) === 21],
  ["product slugs", mapped.products.map((entry) => entry.slug).join("|") === products.map((entry) => entry.slug).join("|")],
  ["category slugs", mapped.categories.map((entry) => entry.slug).join("|") === catalogueCategories.map((entry) => entry.slug).join("|")],
  ["draft products", mapped.products.every((entry) => entry.publicationStatus === "draft" && entry.seo.indexable === false)],
  ["verification states", mapped.products.every((entry, index) => entry.verificationStatus === products[index].verificationStatus)],
  ["classification IDs", mapped.products.every((entry, index) => entry.specificationIds.join("|") === products[index].specificationIds.join("|"))],
];
for (const [label, passed] of checks) { if (!passed) throw new Error(`CMS parity failed: ${label}`); console.info(`PASS ${label}`); }
console.info("CMS adapter parity complete", { products: mapped.products.length, variants: mapped.products.reduce((sum, product) => sum + product.variants.length, 0), categories: mapped.categories.length, applications: mapped.applications.length, specifications: mapped.specifications.length, markets: mapped.markets.length });
