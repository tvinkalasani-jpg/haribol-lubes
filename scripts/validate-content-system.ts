import { getPayload } from "payload";

import config from "@payload-config";
import { assertCmsEnvironment } from "@/cms/environment";
import { Insights, Resources } from "@/cms/collections";
import { enforceInsightPublishingGuard, enforceResourcePublishingGuard, enforceTechnicalDocumentPublishingGuard, insightCategories, validateResourceSource } from "@/cms/content";
import { getRelatedInsights, getReadingTime } from "@/features/content/content-repository";
import type { InsightRecord } from "@/features/content/types";

let passed = 0;
function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Content validation failed: ${message}`);
  passed += 1;
  console.info(`PASS ${String(passed).padStart(2, "0")} ${message}`);
}

async function expectThrow(action: () => unknown | Promise<unknown>, message: string) {
  let threw = false;
  try { await action(); } catch { threw = true; }
  check(threw, message);
}

assertCmsEnvironment();
const payload = await getPayload({ config });
const all = await payload.find({ collection: "insights", depth: 2, limit: 20, overrideAccess: true, sort: "slug" });
check(all.totalDocs === 5, "seed contains exactly five insights");
check(new Set(all.docs.map(({ slug }) => slug)).size === 5, "seed slugs are unique");
check(all.docs.filter(({ publicationStatus }) => publicationStatus === "published").length === 0, "no Insight article is published without business approval");
check(all.docs.filter(({ publicationStatus }) => publicationStatus === "draft").length === 5, "all five seed articles remain drafts");
check(all.docs.every(({ byline }) => byline === "Haribol Lubes Limited"), "seed bylines use the approved company name");
check(insightCategories.length === 7, "category vocabulary stays intentionally small");
check(all.docs.every(({ category }) => insightCategories.some(({ value }) => value === category)), "every insight uses a controlled category");
check(all.docs.every(({ content }) => Boolean(content?.root)), "every seed article has Lexical content");
check(all.docs.every(({ content }) => JSON.stringify(content).includes('"type":"heading"')), "every seed article contains a structured heading");
check(JSON.stringify(all.docs).includes('"listType":"bullet"'), "seed content exercises list rendering");
check(!JSON.stringify(all.docs).includes('"type":"html"'), "seed content contains no raw HTML nodes");
check(!JSON.stringify(all.docs).includes("<script"), "seed content contains no script markup");
check(!JSON.stringify(all.docs).includes("<iframe"), "seed content contains no iframe markup");
check(all.docs.every(({ seo }) => typeof seo?.metaTitle === "string" && typeof seo?.metaDescription === "string"), "all seed articles include controlled SEO copy");
check(all.docs.filter(({ publicationStatus }) => publicationStatus !== "published").every(({ seo }) => seo?.indexable === false), "draft articles are not indexable");

const published = await payload.find({ collection: "insights", depth: 2, limit: 20, overrideAccess: false });
check(published.totalDocs === 0, "public access returns no unapproved insights");
const draft = all.docs.find(({ publicationStatus }) => publicationStatus === "draft");
check(Boolean(draft), "draft fixture exists");
const draftPublic = await payload.find({ collection: "insights", where: { slug: { equals: draft!.slug } }, limit: 1, overrideAccess: false });
check(draftPublic.totalDocs === 0, "draft insight is denied to unauthenticated reads");
const unknown = await payload.find({ collection: "insights", where: { slug: { equals: "unknown-insight" } }, limit: 1, overrideAccess: false });
check(unknown.totalDocs === 0, "unknown insight does not resolve");

await payload.update({ collection: "insights", id: draft!.id, overrideAccess: true, data: { publicationStatus: "archived" } });
const archivedPublic = await payload.find({ collection: "insights", where: { slug: { equals: draft!.slug } }, limit: 1, overrideAccess: false });
check(archivedPublic.totalDocs === 0, "archived insight is denied to unauthenticated reads");
await payload.update({ collection: "insights", id: draft!.id, overrideAccess: true, data: { publicationStatus: "draft" } });

await expectThrow(() => payload.create({ collection: "insights", overrideAccess: true, data: { ...all.docs[0], id: undefined } as never }), "database rejects duplicate insight slugs");
await expectThrow(() => enforceInsightPublishingGuard({ data: { publicationStatus: "published", technicallySensitive: true, verificationStatus: "needs-review" } } as never), "technical publishing guard rejects unverified articles");
check(Boolean(enforceInsightPublishingGuard({ data: { publicationStatus: "published", technicallySensitive: true, verificationStatus: "verified" } } as never)), "technical publishing guard accepts verified articles");
check(Boolean(enforceInsightPublishingGuard({ data: { publicationStatus: "published", technicallySensitive: false, verificationStatus: "needs-review" } } as never)), "general business content is not over-gated");
await expectThrow(() => enforceResourcePublishingGuard({ data: { publicationStatus: "published", verificationStatus: "needs-review" } } as never), "resource publishing guard rejects unverified records");
check(Boolean(await enforceResourcePublishingGuard({ data: { publicationStatus: "draft", verificationStatus: "verified" } } as never)), "resource publishing guard accepts verified drafts without public file access");
await expectThrow(() => enforceResourcePublishingGuard({ data: { publicationStatus: "published", verificationStatus: "verified" }, req: { payload: { findByID: async () => ({ verificationStatus: "needs-review" }) } } } as never), "published resource rejects an unapproved source file");
await expectThrow(() => enforceTechnicalDocumentPublishingGuard({ data: { publicationStatus: "published", verificationStatus: "needs-review" } } as never), "technical document publishing guard rejects unverified metadata");
await expectThrow(() => enforceTechnicalDocumentPublishingGuard({ data: { publicationStatus: "published", verificationStatus: "verified", file: 1 }, req: { payload: { findByID: async () => ({ verificationStatus: "needs-review" }) } } } as never), "technical document publishing guard rejects an unverified private file");
check(Boolean(await enforceTechnicalDocumentPublishingGuard({ data: { publicationStatus: "published", verificationStatus: "verified", file: 1 }, req: { payload: { findByID: async () => ({ verificationStatus: "verified" }) } } } as never)), "technical document publishing guard accepts verified metadata and private file");
await expectThrow(() => enforceResourcePublishingGuard({ data: { publicationStatus: "published", verificationStatus: "verified", technicalDocument: 1 }, req: { payload: { findByID: async ({ collection }: { collection: string }) => collection === "technical-documents" ? { publicationStatus: "published", verificationStatus: "verified", file: 2 } : { verificationStatus: "needs-review" } } } } as never), "published technical resource rejects an unverified private file");
await expectThrow(() => validateResourceSource({ data: {} } as never), "resource requires exactly one source");
await expectThrow(() => validateResourceSource({ data: { file: 1, technicalDocument: 2 } } as never), "resource rejects duplicate file sources");
check(Boolean(validateResourceSource({ data: { file: 1 } } as never)), "non-technical Media-backed resource is valid");
check(Boolean(validateResourceSource({ data: { technicalDocument: 1 } } as never)), "Technical Document-backed resource is valid");

const resources = await payload.find({ collection: "resources", limit: 10, overrideAccess: false });
check(resources.totalDocs === 0, "public resource library is intentionally empty");
check(Resources.access?.create?.({ req: { user: { role: "editor" } } } as never) === true, "editor may create resource records");
check(Resources.access?.create?.({ req: { user: { role: "admin" } } } as never) === true, "administrator may create resource records");
check(Resources.access?.create?.({ req: { user: null } } as never) === false, "unauthenticated resource creation is rejected");
check(Insights.access?.update?.({ req: { user: { role: "editor" } } } as never) === true, "editor may update insights");
check(Insights.access?.delete?.({ req: { user: { role: "admin" } } } as never) === true, "administrator may delete insights");
check(Insights.access?.update?.({ req: { user: null } } as never) === false, "unauthenticated insight edits are rejected");

const seededInsight = all.docs[0]!;
check(getReadingTime(seededInsight.content as Record<string, unknown>) >= 1, "reading time is derived from content");
const relatedFixtureBase = { title: "", excerpt: "", content: {}, byline: "Haribol Lubes Limited", updatedAt: "2026-10-04", featured: false, technicallySensitive: false, heroImage: undefined, relatedCategories: [], relatedResources: [], seo: { indexable: false } };
const relatedCurrent = { ...relatedFixtureBase, id: "a", slug: "a", category: "automotive", tags: ["engines"], relatedProducts: [{ id: "p1", slug: "p1", title: "P1", href: "/p1" }], relatedApplications: [], relatedIndustries: [] } as InsightRecord;
const relatedCandidate = { ...relatedFixtureBase, id: "b", slug: "b", category: "automotive", tags: [], relatedProducts: [{ id: "p1", slug: "p1", title: "P1", href: "/p1" }], relatedApplications: [], relatedIndustries: [] } as InsightRecord;
const related = getRelatedInsights(relatedCurrent, [relatedCurrent, relatedCandidate], 3);
check(related.length === 1 && related[0]?.id === "b", "related insight logic is deterministic and excludes the current record");
check(all.docs.some(({ relatedProducts }) => Array.isArray(relatedProducts) && relatedProducts.length > 0), "product relationships are populated");
check(all.docs.some(({ relatedApplications }) => Array.isArray(relatedApplications) && relatedApplications.length > 0), "application relationships are populated");
check(all.docs.some(({ relatedIndustries }) => Array.isArray(relatedIndustries) && relatedIndustries.length > 0), "industry relationships are populated");
check(all.docs.some(({ relatedCategories }) => Array.isArray(relatedCategories) && relatedCategories.length > 0), "category relationships are populated");
check(all.docs.every(({ relatedResources }) => Array.isArray(relatedResources) && relatedResources.length === 0), "no fake resource links are seeded");
check(all.docs.every(({ heroImage }) => !heroImage), "no fake or hotlinked hero images are seeded");

const publicAfterRestore = await payload.find({ collection: "insights", limit: 20, overrideAccess: false });
check(publicAfterRestore.totalDocs === 0, "publication state remains private after privacy tests");
const seededAgain = await payload.find({ collection: "insights", limit: 20, overrideAccess: true });
check(seededAgain.totalDocs === 5, "repeatable seed leaves no duplicates");
console.info(`Content system validation complete: ${passed} checks passed.`);
