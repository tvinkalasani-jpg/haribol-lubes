import { getPayload } from "payload";

import config from "@payload-config";
import { assertCmsEnvironment } from "@/cms/environment";
import { brands } from "@/data/brands";
import { applications } from "@/data/catalogue/applications";
import { catalogueCategories } from "@/data/catalogue/categories";
import { markets } from "@/data/catalogue/markets";
import { products } from "@/data/catalogue/products";
import { specifications } from "@/data/catalogue/specifications";

type CmsDocument = Record<string, unknown> & { id: string | number };
type CmsClient = {
  create(args: { collection: string; data: Record<string, unknown>; overrideAccess: boolean }): Promise<CmsDocument>;
  find(args: { collection: string; where: Record<string, unknown>; limit: number; overrideAccess: boolean }): Promise<{ docs: CmsDocument[] }>;
  update(args: { collection: string; id: string | number; data: Record<string, unknown>; overrideAccess: boolean }): Promise<CmsDocument>;
};

async function upsert(client: CmsClient, collection: string, key: string, value: string, data: Record<string, unknown>): Promise<CmsDocument> {
  const existing = await client.find({ collection, where: { [key]: { equals: value } }, limit: 1, overrideAccess: true });
  return existing.docs[0]
    ? client.update({ collection, id: existing.docs[0].id, data, overrideAccess: true })
    : client.create({ collection, data, overrideAccess: true });
}

function textNode(text: string) {
  return { type: "text", detail: 0, format: 0, mode: "normal", style: "", text, version: 1 };
}

function paragraph(text: string) {
  return { type: "paragraph", children: [textNode(text)], direction: "ltr", format: "", indent: 0, textFormat: 0, textStyle: "", version: 1 };
}

function heading(text: string, tag: "h2" | "h3" = "h2") {
  return { type: "heading", children: [textNode(text)], direction: "ltr", format: "", indent: 0, tag, version: 1 };
}

function bulletList(items: readonly string[]) {
  return { type: "list", children: items.map((text, index) => ({ type: "listitem", children: [paragraph(text)], direction: "ltr", format: "", indent: 0, value: index + 1, version: 1 })), direction: "ltr", format: "", indent: 0, listType: "bullet", start: 1, tag: "ul", version: 1 };
}

function insightContent(introduction: string, sections: readonly { heading: string; paragraphs: readonly string[]; points?: readonly string[] }[]) {
  return { root: { type: "root", children: [paragraph(introduction), ...sections.flatMap((section) => [heading(section.heading), ...section.paragraphs.map(paragraph), ...(section.points ? [bulletList(section.points)] : [])])], direction: "ltr", format: "", indent: 0, version: 1 } };
}

assertCmsEnvironment();
const payload = await getPayload({ config });
const client = payload as unknown as CmsClient;
const marketIds = new Map<string, string | number>();
for (const market of markets) marketIds.set(market.id, (await upsert(client, "markets", "slug", market.slug, market)).id);

const brandIds = new Map<string, string | number>();
for (const brand of brands) brandIds.set(brand.id, (await upsert(client, "brands", "slug", brand.slug, { name: brand.name, slug: brand.slug, shortDescription: brand.shortDescription, status: brand.status, featured: brand.featured, brandType: brand.brandType, accent: brand.brandAccent, notes: brand.notes, verificationStatus: "catalogue-derived" })).id);

const applicationIds = new Map<string, string | number>();
for (const application of applications) applicationIds.set(application.id, (await upsert(client, "applications", "slug", application.slug, application)).id);

const specificationIds = new Map<string, string | number>();
for (const specification of specifications) {
  const classificationType = specification.code.includes("GL-") ? "gl" : specification.code.includes("Dexron") ? "dexron" : specification.code.includes("TO-4") ? "to-4" : specification.code.includes("MT-1") ? "mt-1" : specification.code.startsWith("API") ? "api-performance" : "technical-classification";
  specificationIds.set(specification.id, (await upsert(client, "specifications", "slug", specification.id, { name: specification.name, code: specification.code, slug: specification.id, classificationType, issuingBody: specification.issuingBody, isApproval: specification.isApproval, verificationStatus: specification.verificationStatus })).id);
}

const categoryIds = new Map<string, string | number>();
for (const category of catalogueCategories.filter((entry) => !entry.parentCategoryId)) categoryIds.set(category.id, (await upsert(client, "product-categories", "slug", category.slug, { name: category.name, slug: category.slug, description: category.description, displayOrder: category.displayOrder, seo: { indexable: false }, publicationStatus: "draft", verificationStatus: category.verificationStatus })).id);
for (const category of catalogueCategories.filter((entry) => entry.parentCategoryId)) categoryIds.set(category.id, (await upsert(client, "product-categories", "slug", category.slug, { name: category.name, slug: category.slug, description: category.description, parent: categoryIds.get(category.parentCategoryId!), displayOrder: category.displayOrder, seo: { indexable: false }, publicationStatus: "draft", verificationStatus: category.verificationStatus })).id);

const productIds = new Map<string, string | number>();
for (const product of products) {
  const record = await upsert(client, "products", "slug", product.slug, { name: product.name, slug: product.slug, brand: brandIds.get(product.brandId), primaryCategory: categoryIds.get(product.primaryCategoryId), secondaryCategories: product.secondaryCategoryIds?.map((id) => categoryIds.get(id)).filter(Boolean), productFamily: product.productFamily, shortDescription: product.shortDescription, description: product.description, benefits: product.benefits?.map((text) => ({ text })), applications: product.applicationIds.map((id) => applicationIds.get(id)).filter(Boolean), industrySlugs: [...product.industryIds], lubricantType: product.lubricantType?.value, baseOilType: product.baseOilType?.value, specifications: product.specificationIds.map((id) => specificationIds.get(id)).filter(Boolean), markets: product.markets.map((entry) => marketIds.get(entry.marketId)).filter(Boolean), sourceReference: product.sourceReference, lastReviewedAt: product.lastReviewedAt, searchKeywords: [...product.searchKeywords], seo: { metaTitle: product.seo.title, metaDescription: product.seo.description, indexable: false }, publicationStatus: "draft", verificationStatus: product.verificationStatus });
  productIds.set(product.id, record.id);
}

let variantCount = 0;
for (const product of products) for (const variant of product.variants) {
  await upsert(client, "product-variants", "slug", variant.id, { name: variant.name, slug: variant.id, product: productIds.get(product.id), kind: variant.kind, sku: variant.sku, productCode: variant.productCode, viscosityGrade: variant.viscosityGrade?.value, specifications: variant.specificationIds?.map((id) => specificationIds.get(id)).filter(Boolean), packSize: variant.packSize?.value, packUnit: variant.packUnit, containerType: variant.containerType, markets: variant.marketIds.map((id) => marketIds.get(id)).filter(Boolean), availabilityStatus: "needs-confirmation", sourceReference: variant.sourceReference, verificationStatus: variant.verificationStatus });
  variantCount += 1;
}

const seededInsights = [
  {
    title: "Understanding SAE Viscosity Grades", slug: "understanding-sae-viscosity-grades",
    excerpt: "A practical introduction to what the two numbers on a multigrade engine-oil label describe, and what they do not decide on their own.",
    category: "lubricant-basics", featured: true, technicallySensitive: true,
    publicationStatus: "draft", verificationStatus: "verified", publishedAt: null,
    tags: [{ tag: "viscosity" }, { tag: "engine oil" }], relatedIndustries: ["automotive", "fleet-operators"],
    relatedProducts: [productIds.get("mastermax-engine-oils")].filter(Boolean), relatedCategories: [categoryIds.get("engine-oils")].filter(Boolean), relatedApplications: [applicationIds.get("petrol-engines"), applicationIds.get("diesel-engines")].filter(Boolean),
    content: insightContent(
      "SAE viscosity grades provide a common way to describe how an engine oil flows under defined test conditions. They are one part of product selection, alongside the equipment maker’s stated viscosity and performance requirements.",
      [
        { heading: "Reading a multigrade label", paragraphs: ["In a grade such as 15W-40, the number before W relates to defined low-temperature behaviour. The second number relates to viscosity requirements measured at higher temperatures. A lower or higher number is not a general quality ranking."], points: ["Use the grade stated for the equipment and operating conditions.", "Check the separate performance classification on the product documentation.", "Confirm uncertain requirements before mixing or changing products."] },
        { heading: "Viscosity is only one selection factor", paragraphs: ["Two oils with the same SAE grade can carry different performance classifications and intended applications. The full specification matters because viscosity alone does not establish additive performance, compatibility or manufacturer approval."], points: ["SAE grade describes viscosity behaviour.", "Performance classifications describe separate tested requirements.", "A product label or current technical data sheet should be checked as a complete record."] },
        { heading: "A practical selection process", paragraphs: ["Start with the equipment manual or a verified service requirement. Match the stated viscosity grade and performance classification, then check that the chosen product is intended for the application and operating environment."], points: ["Record the equipment and model.", "Record the required grade and classification.", "Confirm the current product documentation with the supplier."] },
      ],
    ),
  },
  {
    title: "Understanding API Engine-Oil Classifications", slug: "understanding-api-engine-oil-classifications", excerpt: "How API service categories add performance context beyond an engine oil’s viscosity grade.", category: "technical-guides", featured: false, technicallySensitive: true, publicationStatus: "draft", verificationStatus: "needs-review", tags: [{ tag: "API" }, { tag: "engine oil" }], relatedIndustries: ["automotive"], relatedProducts: [productIds.get("mastermax-engine-oils")].filter(Boolean), relatedCategories: [categoryIds.get("engine-oils")].filter(Boolean), relatedApplications: [applicationIds.get("diesel-engines")].filter(Boolean), content: insightContent("API classifications communicate defined engine-oil performance categories. They should be read together with viscosity and the equipment requirement.", [{ heading: "A separate part of the label", paragraphs: ["The API category and SAE grade answer different questions. Confirm both against a current requirement before choosing a lubricant."] }]) },
  {
    title: "GL-4 vs GL-5: Understanding Gear-Oil Classifications", slug: "gl-4-vs-gl-5-understanding-gear-oil-classifications", excerpt: "A careful overview of two common gear-oil classifications and why the equipment requirement remains decisive.", category: "technical-guides", featured: false, technicallySensitive: true, publicationStatus: "draft", verificationStatus: "needs-review", tags: [{ tag: "gear oil" }, { tag: "GL classification" }], relatedIndustries: ["transport-logistics"], relatedProducts: [productIds.get("mastermax-transmission-gear-oils")].filter(Boolean), relatedCategories: [categoryIds.get("gear-oils")].filter(Boolean), relatedApplications: [applicationIds.get("gearboxes")].filter(Boolean), content: insightContent("GL classifications identify different performance requirements for gear lubricants. One should not be substituted for another without checking the equipment requirement.", [{ heading: "Classification before assumption", paragraphs: ["The correct selection depends on the gearbox or axle design, materials and stated service category. Use current technical documentation and seek support when the requirement is unclear."] }]) },
  {
    title: "What ISO VG Numbers Mean in Hydraulic Oils", slug: "what-iso-vg-numbers-mean-in-hydraulic-oils", excerpt: "An introductory guide to ISO viscosity grades and the information still needed for hydraulic-oil selection.", category: "industrial", featured: false, technicallySensitive: true, publicationStatus: "draft", verificationStatus: "needs-review", tags: [{ tag: "hydraulics" }, { tag: "ISO VG" }], relatedIndustries: ["manufacturing", "construction"], relatedProducts: [productIds.get("mastermax-hydraulic-oils")].filter(Boolean), relatedCategories: [categoryIds.get("hydraulic-oils")].filter(Boolean), relatedApplications: [applicationIds.get("hydraulic-systems")].filter(Boolean), content: insightContent("ISO VG numbers group industrial lubricants by kinematic viscosity around a defined reference temperature. They do not describe every aspect of hydraulic-fluid performance.", [{ heading: "Use the complete requirement", paragraphs: ["Confirm the viscosity grade, fluid type and any additional performance requirement for the hydraulic system and operating environment."] }]) },
  {
    title: "TDS vs SDS: What Each Document Is Used For", slug: "tds-vs-sds-what-each-document-is-used-for", excerpt: "A concise distinction between product technical data and safety information when reviewing lubricant documents.", category: "business-procurement", featured: false, technicallySensitive: false, publicationStatus: "draft", verificationStatus: "needs-review", tags: [{ tag: "documents" }, { tag: "procurement" }], relatedIndustries: ["wholesale-retail"], relatedProducts: [], relatedCategories: [], relatedApplications: [], content: insightContent("A technical data sheet and a safety data sheet support different decisions. Procurement and maintenance teams commonly need access to both.", [{ heading: "Two different records", paragraphs: ["A TDS generally presents product characteristics and intended-use information. An SDS provides structured hazard, handling and emergency information. Always use the current approved version supplied for the product and market."] }]) },
] as const;

for (const insight of seededInsights) {
  await upsert(client, "insights", "slug", insight.slug, {
    ...insight,
    byline: "Haribol Lubes Limited",
    relatedResources: [],
    seo: { metaTitle: insight.title, metaDescription: insight.excerpt, indexable: false },
  });
}

const adminEmail = process.env.PAYLOAD_SEED_ADMIN_EMAIL;
const adminPassword = process.env.PAYLOAD_SEED_ADMIN_PASSWORD;
if (adminEmail && adminPassword) await upsert(client, "users", "email", adminEmail, { email: adminEmail, password: adminPassword, name: process.env.PAYLOAD_SEED_ADMIN_NAME || "Development Administrator", role: "admin", loginAttempts: 0, lockUntil: null });

console.info("CMS seed complete", { brands: brands.length, categories: catalogueCategories.length, applications: applications.length, specifications: specifications.length, markets: markets.length, products: products.length, variants: variantCount, insights: seededInsights.length, publishedInsights: 0, resources: 0, productOffers: 0, orders: 0, paymentTransactions: 0, adminCreated: Boolean(adminEmail && adminPassword) });
