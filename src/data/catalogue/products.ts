import type {
  MarketAvailability,
  Product,
  ProductImage,
  ProductVariant,
  VerifiedValue,
} from "@/types/product";

const reviewedAt = "2026-09-27";
const kenyaAvailability: readonly MarketAvailability[] = [
  {
    marketId: "ke",
    availabilityStatus: "needs-confirmation",
    verificationStatus: "needs-review",
    notes: "Confirm current Kenyan stock and pack availability before publication.",
  },
];

function catalogueValue(value: string, sourceReference: string): VerifiedValue<string> {
  return { value, verificationStatus: "catalogue-derived", sourceReference };
}

function formulationVariant(
  productId: string,
  id: string,
  name: string,
  sourceReference: string,
  options: {
    viscosityGrade?: string;
    specificationIds?: readonly string[];
  } = {},
): ProductVariant {
  return {
    id,
    productId,
    kind: "formulation",
    name,
    viscosityGrade: options.viscosityGrade
      ? catalogueValue(options.viscosityGrade, sourceReference)
      : undefined,
    specificationIds: options.specificationIds,
    marketIds: ["ke"],
    availabilityStatus: "needs-confirmation",
    verificationStatus: "catalogue-derived",
    sourceReference,
  };
}

function catalogueImage(
  id: string,
  src: string,
  alt: string,
  sourceReference: string,
): ProductImage {
  return {
    id,
    src,
    alt,
    role: "packshot",
    sortOrder: 10,
    sourceType: "catalogue-extract",
    verificationStatus: "catalogue-derived",
    sourceReference,
    temporary: true,
  };
}

function neutralFamilyImage(id: string, alt: string, sourceReference: string): ProductImage {
  return {
    id,
    src: "/brand/mastermax/mastermax-pack-family.svg",
    alt,
    role: "gallery",
    sortOrder: 10,
    sourceType: "project-generated",
    verificationStatus: "needs-review",
    sourceReference,
    temporary: true,
  };
}

const engineSource = "Mastermax 2024 catalogue, page 3.";
const hydraulicSource = "Mastermax 2024 catalogue, page 4.";
const transmissionSource = "Mastermax 2024 catalogue, page 5.";
const compressorSource = "Mastermax 2024 catalogue, page 6.";
const industrialSource = "Mastermax 2024 catalogue, page 8.";

const engineProductId = "mastermax-engine-oils";
const hydraulicProductId = "mastermax-hydraulic-oils";
const transmissionProductId = "mastermax-transmission-gear-oils";
const compressorProductId = "mastermax-maxpress-compressor-oil";

export const products: readonly Product[] = [
  {
    id: engineProductId,
    slug: "mastermax-engine-oils",
    name: "Mastermax Engine Oils",
    brandId: "mastermax",
    productFamily: "Engine Oils",
    primaryCategoryId: "engine-oils",
    shortDescription: "Catalogue-listed multigrade and monograde engine oils.",
    description: "A Mastermax product family covering the engine-oil grades and performance classifications listed in the supplied catalogue.",
    applicationIds: ["petrol-engines", "diesel-engines", "heavy-duty-engines"],
    industryIds: ["automotive", "garages-workshops", "transport-logistics", "fleet-operators"],
    lubricantType: catalogueValue("Engine oil", engineSource),
    specificationIds: ["api-ch-4", "api-ci-4", "api-cj-4", "api-sl-cf", "api-sn-cf"],
    technicalProperties: [],
    variants: [
      formulationVariant(engineProductId, "mastermax-engine-sae-40", "SAE 40 monograde", engineSource, { viscosityGrade: "SAE 40" }),
      formulationVariant(engineProductId, "mastermax-engine-15w-40-ch-4", "15W-40 API CH-4", engineSource, { viscosityGrade: "15W-40", specificationIds: ["api-ch-4"] }),
      formulationVariant(engineProductId, "mastermax-engine-15w-40-ci-4", "15W-40 API CI-4", engineSource, { viscosityGrade: "15W-40", specificationIds: ["api-ci-4"] }),
      formulationVariant(engineProductId, "mastermax-engine-10w-40-cj-4", "10W-40 API CJ-4", engineSource, { viscosityGrade: "10W-40", specificationIds: ["api-cj-4"] }),
      formulationVariant(engineProductId, "mastermax-engine-20w-50-sl-cf", "20W-50 API SL/CF", engineSource, { viscosityGrade: "20W-50", specificationIds: ["api-sl-cf"] }),
      formulationVariant(engineProductId, "mastermax-engine-5w-40-sn-cf", "5W-40 API SN/CF", engineSource, { viscosityGrade: "5W-40", specificationIds: ["api-sn-cf"] }),
    ],
    documents: [],
    images: [catalogueImage("mastermax-engine-catalogue-packshot", "/brand/mastermax/catalogue/engine-oil-15w40.webp", "Orange Mastermax 15W-40 engine oil container shown in the supplied catalogue", engineSource)],
    markets: kenyaAvailability,
    relationships: [],
    searchKeywords: ["engine oil", "monograde", "multigrade", "petrol", "diesel", "heavy duty"],
    seo: { canonicalSlug: "mastermax-engine-oils", indexable: false },
    publicationStatus: "draft",
    verificationStatus: "catalogue-derived",
    lastReviewedAt: reviewedAt,
    sourceReference: engineSource,
  },
  {
    id: hydraulicProductId,
    slug: "mastermax-hydraulic-oils",
    name: "Mastermax Hydraulic Oils",
    brandId: "mastermax",
    productFamily: "Hydraulic Oils",
    primaryCategoryId: "hydraulic-oils",
    shortDescription: "Hydraulic oils in the ISO viscosity grades listed by the catalogue.",
    applicationIds: ["hydraulic-systems", "industrial-machinery"],
    industryIds: ["manufacturing", "construction", "agriculture", "industrial-machinery"],
    lubricantType: catalogueValue("Hydraulic oil", hydraulicSource),
    specificationIds: [],
    technicalProperties: [],
    variants: [
      formulationVariant(hydraulicProductId, "mastermax-hydraulic-iso-vg-32", "ISO VG 32", hydraulicSource, { viscosityGrade: "ISO VG 32" }),
      formulationVariant(hydraulicProductId, "mastermax-hydraulic-iso-vg-46", "ISO VG 46", hydraulicSource, { viscosityGrade: "ISO VG 46" }),
      formulationVariant(hydraulicProductId, "mastermax-hydraulic-iso-vg-68", "ISO VG 68", hydraulicSource, { viscosityGrade: "ISO VG 68" }),
    ],
    documents: [],
    images: [catalogueImage("mastermax-hydraulic-catalogue-label", "/brand/mastermax/catalogue/hydraulic-oil-iso-vg-68.webp", "Mastermax ISO VG 68 hydraulic oil label artwork from the supplied catalogue", hydraulicSource)],
    markets: kenyaAvailability,
    relationships: [],
    searchKeywords: ["hydraulic oil", "hydraulic fluid", "ISO VG"],
    seo: { canonicalSlug: "mastermax-hydraulic-oils", indexable: false },
    publicationStatus: "draft",
    verificationStatus: "catalogue-derived",
    lastReviewedAt: reviewedAt,
    sourceReference: hydraulicSource,
  },
  {
    id: transmissionProductId,
    slug: "mastermax-transmission-gear-oils",
    name: "Mastermax Transmission / Gear Oils",
    brandId: "mastermax",
    productFamily: "Transmission / Gear Oils",
    primaryCategoryId: "transmission-gear-oils",
    secondaryCategoryIds: ["gear-oils", "transmission-fluids"],
    shortDescription: "Catalogue-listed gear, transmission and driveline oil formulations.",
    applicationIds: ["gearboxes", "automatic-transmissions", "driveline-systems"],
    industryIds: ["automotive", "garages-workshops", "transport-logistics", "fleet-operators"],
    lubricantType: catalogueValue("Transmission and gear oil", transmissionSource),
    specificationIds: ["gl-4", "gl-5", "dexron-ii", "api-to-4", "api-mt-1"],
    technicalProperties: [],
    variants: [
      formulationVariant(transmissionProductId, "mastermax-gear-85w-140-gl-4", "85W-140 GL-4", transmissionSource, { viscosityGrade: "85W-140", specificationIds: ["gl-4"] }),
      formulationVariant(transmissionProductId, "mastermax-gear-80w-90-gl-4", "80W-90 GL-4", transmissionSource, { viscosityGrade: "80W-90", specificationIds: ["gl-4"] }),
      formulationVariant(transmissionProductId, "mastermax-gear-85w-140-gl-5", "85W-140 GL-5", transmissionSource, { viscosityGrade: "85W-140", specificationIds: ["gl-5"] }),
      formulationVariant(transmissionProductId, "mastermax-gear-80w-90-gl-5", "80W-90 GL-5", transmissionSource, { viscosityGrade: "80W-90", specificationIds: ["gl-5"] }),
      formulationVariant(transmissionProductId, "mastermax-atf-dexron-ii", "ATF Dexron II", transmissionSource, { specificationIds: ["dexron-ii"] }),
      formulationVariant(transmissionProductId, "mastermax-transmission-sae-30-to-4", "SAE 30 API TO-4", transmissionSource, { viscosityGrade: "SAE 30", specificationIds: ["api-to-4"] }),
      formulationVariant(transmissionProductId, "mastermax-transmission-sae-50-mt-1-gl-4", "SAE 50 API MT-1 GL-4", transmissionSource, { viscosityGrade: "SAE 50", specificationIds: ["api-mt-1", "gl-4"] }),
    ],
    documents: [],
    images: [catalogueImage("mastermax-transmission-catalogue-packshot", "/brand/mastermax/catalogue/gear-oil-85w140.webp", "Orange Mastermax SAE 85W-140 gear oil container shown in the supplied catalogue", transmissionSource)],
    markets: kenyaAvailability,
    relationships: [],
    searchKeywords: ["gear oil", "transmission fluid", "ATF", "driveline"],
    seo: { canonicalSlug: "mastermax-transmission-gear-oils", indexable: false },
    publicationStatus: "draft",
    verificationStatus: "catalogue-derived",
    lastReviewedAt: reviewedAt,
    sourceReference: transmissionSource,
  },
  {
    id: compressorProductId,
    slug: "mastermax-maxpress-compressor-oil",
    name: "Mastermax Maxpress Compressor Oil",
    brandId: "mastermax",
    productFamily: "Maxpress",
    primaryCategoryId: "compressor-oils",
    shortDescription: "The Maxpress compressor-oil family in five catalogue-listed grades.",
    applicationIds: ["compressors", "industrial-machinery"],
    industryIds: ["manufacturing", "industrial-machinery"],
    lubricantType: catalogueValue("Compressor oil", compressorSource),
    specificationIds: [],
    technicalProperties: [],
    variants: ["46", "68", "100", "150", "220"].map((grade) =>
      formulationVariant(compressorProductId, `mastermax-maxpress-${grade}`, `Maxpress ${grade}`, compressorSource, { viscosityGrade: grade }),
    ),
    documents: [],
    images: [catalogueImage("mastermax-maxpress-catalogue-label", "/brand/mastermax/catalogue/compressor-oil-68.webp", "Mastermax Compressor Oil 68 label artwork from the supplied catalogue", compressorSource)],
    markets: kenyaAvailability,
    relationships: [],
    searchKeywords: ["Maxpress", "compressor oil", "industrial compressor"],
    seo: { canonicalSlug: "mastermax-maxpress-compressor-oil", indexable: false },
    publicationStatus: "draft",
    verificationStatus: "catalogue-derived",
    lastReviewedAt: reviewedAt,
    sourceReference: compressorSource,
  },
  {
    id: "mastermax-soluble-cutting-oil",
    slug: "mastermax-soluble-cutting-oil",
    name: "Mastermax Soluble Cutting Oil",
    brandId: "mastermax",
    productFamily: "Industrial Oils",
    primaryCategoryId: "industrial-lubricants",
    shortDescription: "Soluble cutting oil listed in the Mastermax catalogue.",
    applicationIds: ["metalworking"],
    industryIds: ["manufacturing"],
    lubricantType: catalogueValue("Soluble cutting oil", industrialSource),
    specificationIds: [], technicalProperties: [], variants: [], documents: [],
    images: [neutralFamilyImage("mastermax-soluble-cutting-oil-family-visual", "Neutral Mastermax family visual for Soluble Cutting Oil", `${industrialSource} No product packshot is shown on the source page.`)],
    markets: kenyaAvailability, relationships: [],
    searchKeywords: ["soluble cutting oil", "cutting oil", "metalworking"],
    seo: { canonicalSlug: "mastermax-soluble-cutting-oil", indexable: false },
    publicationStatus: "draft", verificationStatus: "catalogue-derived", lastReviewedAt: reviewedAt, sourceReference: industrialSource,
  },
  {
    id: "mastermax-mould-release-oil",
    slug: "mastermax-mould-release-oil",
    name: "Mastermax Mould Release Oil",
    brandId: "mastermax",
    productFamily: "Industrial Oils",
    primaryCategoryId: "industrial-lubricants",
    shortDescription: "Mould release oil listed in the Mastermax catalogue.",
    applicationIds: ["mould-release"], industryIds: ["manufacturing"],
    lubricantType: catalogueValue("Mould release oil", industrialSource),
    specificationIds: [], technicalProperties: [], variants: [], documents: [],
    images: [neutralFamilyImage("mastermax-mould-release-oil-family-visual", "Neutral Mastermax family visual for Mould Release Oil", `${industrialSource} No product packshot is shown on the source page.`)],
    markets: kenyaAvailability, relationships: [], searchKeywords: ["mould release oil", "industrial oil"],
    seo: { canonicalSlug: "mastermax-mould-release-oil", indexable: false },
    publicationStatus: "draft", verificationStatus: "catalogue-derived", lastReviewedAt: reviewedAt, sourceReference: industrialSource,
  },
  ...[
    { id: "mastermax-mp3-chassis-grease", slug: "mastermax-mp3-chassis-grease", name: "Mastermax MP3 Chassis Grease", applicationIds: ["chassis"], industryIds: ["automotive", "garages-workshops", "transport-logistics", "fleet-operators"], keywords: ["MP3", "chassis grease"] },
    { id: "mastermax-ep3-crusher-grease", slug: "mastermax-ep3-crusher-grease", name: "Mastermax EP3 Crusher Grease", applicationIds: ["crushers"], industryIds: ["construction", "industrial-machinery"], keywords: ["EP3", "crusher grease"] },
    { id: "mastermax-high-temperature-bearing-grease", slug: "mastermax-high-temperature-bearing-grease", name: "Mastermax High-Temperature Bearing Grease", applicationIds: ["bearings"], industryIds: ["manufacturing", "industrial-machinery"], keywords: ["high temperature", "bearing grease"] },
    { id: "mastermax-ep00-liquid-grease", slug: "mastermax-ep00-liquid-grease", name: "Mastermax EP00 Liquid Grease", applicationIds: ["industrial-machinery"], industryIds: ["industrial-machinery"], keywords: ["EP00", "liquid grease"] },
  ].map((entry): Product => ({
    id: entry.id,
    slug: entry.slug,
    name: entry.name,
    brandId: "mastermax",
    productFamily: "Greases",
    primaryCategoryId: "greases",
    shortDescription: `${entry.name.replace("Mastermax ", "")} listed in the Mastermax catalogue.`,
    applicationIds: entry.applicationIds,
    industryIds: entry.industryIds,
    lubricantType: catalogueValue("Lubricating grease", industrialSource),
    specificationIds: [], technicalProperties: [], variants: [], documents: [],
    images: [neutralFamilyImage(`${entry.id}-family-visual`, `Neutral Mastermax family visual for ${entry.name.replace("Mastermax ", "")}`, `${industrialSource} No product packshot is shown on the source page.`)],
    markets: kenyaAvailability, relationships: [], searchKeywords: entry.keywords,
    seo: { canonicalSlug: entry.slug, indexable: false },
    publicationStatus: "draft", verificationStatus: "catalogue-derived", lastReviewedAt: reviewedAt, sourceReference: industrialSource,
  })),
] as const;

export const productVariants = products.flatMap((product) => product.variants);
