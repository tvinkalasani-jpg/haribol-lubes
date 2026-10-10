import { getProductById } from "@/data/catalogue/selectors";
import { assertCatalogueIntegrity } from "@/data/catalogue/validation";
import type { Product } from "@/types/product";

export type CatalogueSourceStatus = "catalogue-derived" | "relationship-unconfirmed";

export type MastermaxCatalogueGroup = {
  id: "engine" | "hydraulic" | "transmission" | "compressor" | "industrial" | "greases";
  brandId: "mastermax";
  category: string;
  subCategory: string;
  description: string;
  knownGrades: readonly string[];
  displayGradeCount: number;
  futureHref: string;
  image: {
    src: string;
    alt: string;
    sourceReference: string;
  };
  sourceStatus: CatalogueSourceStatus;
  verificationRequired: boolean;
};

type GroupDefinition = Omit<
  MastermaxCatalogueGroup,
  "brandId" | "knownGrades" | "image" | "sourceStatus" | "verificationRequired"
> & {
  productIds: readonly string[];
};

function requireProduct(productId: string): Product {
  const product = getProductById(productId);

  if (!product) {
    throw new Error(`Missing Mastermax catalogue product: ${productId}`);
  }

  return product;
}

function getCatalogueLabels(products: readonly Product[]): readonly string[] {
  return products.flatMap((product) =>
    product.variants.length > 0
      ? product.variants.map((variant) => variant.name)
      : [product.name.replace(/^Mastermax /, "")],
  );
}

function createCatalogueGroup(definition: GroupDefinition): MastermaxCatalogueGroup {
  const groupProducts = definition.productIds.map(requireProduct);
  const leadProduct = groupProducts[0];
  const leadImage = leadProduct?.images[0];

  if (!leadProduct || !leadImage) {
    throw new Error(`Catalogue group ${definition.id} requires a product image.`);
  }

  return {
    id: definition.id,
    brandId: "mastermax",
    category: definition.category,
    subCategory: definition.subCategory,
    description: definition.description,
    knownGrades: getCatalogueLabels(groupProducts),
    displayGradeCount: definition.displayGradeCount,
    futureHref: definition.futureHref,
    image: {
      src: leadImage.src,
      alt: leadImage.alt,
      sourceReference: leadImage.sourceReference ?? leadProduct.sourceReference,
    },
    sourceStatus: "catalogue-derived",
    verificationRequired: true,
  };
}

assertCatalogueIntegrity();

export const mastermaxCatalogueTaxonomy: readonly MastermaxCatalogueGroup[] = [
  createCatalogueGroup({
    id: "engine",
    category: "Engine Oils",
    subCategory: "Automotive and commercial engine oils",
    description:
      "Catalogue-listed multigrade and monograde engine oils for automotive and commercial applications.",
    displayGradeCount: 4,
    futureHref: "/products/engine-oils",
    productIds: ["mastermax-engine-oils"],
  }),
  createCatalogueGroup({
    id: "hydraulic",
    category: "Hydraulic Oils",
    subCategory: "Hydraulic fluids",
    description:
      "Hydraulic oil grades organised around the ISO viscosity grades listed in the supplied catalogue.",
    displayGradeCount: 3,
    futureHref: "/products/hydraulic-oils",
    productIds: ["mastermax-hydraulic-oils"],
  }),
  createCatalogueGroup({
    id: "transmission",
    category: "Transmission / Gear Oils",
    subCategory: "Transmission, driveline and gear oils",
    description:
      "Transmission and gear oil entries spanning catalogue-listed gear grades, ATF and driveline applications.",
    displayGradeCount: 4,
    futureHref: "/products/transmission-gear-oils",
    productIds: ["mastermax-transmission-gear-oils"],
  }),
  createCatalogueGroup({
    id: "compressor",
    category: "Compressor Oils",
    subCategory: "Maxpress compressor oils",
    description:
      "The Maxpress compressor oil series in the viscosity entries listed by the supplied catalogue.",
    displayGradeCount: 4,
    futureHref: "/products/compressor-oils",
    productIds: ["mastermax-maxpress-compressor-oil"],
  }),
  createCatalogueGroup({
    id: "industrial",
    category: "Industrial Oils",
    subCategory: "Process and application oils",
    description:
      "Catalogue-listed oils for cutting and mould-release applications in industrial environments.",
    displayGradeCount: 2,
    futureHref: "/products/industrial-lubricants",
    productIds: ["mastermax-soluble-cutting-oil", "mastermax-mould-release-oil"],
  }),
  createCatalogueGroup({
    id: "greases",
    category: "Greases",
    subCategory: "Automotive and industrial greases",
    description:
      "Grease entries for chassis, crusher, bearing and liquid-grease applications listed in the catalogue.",
    displayGradeCount: 4,
    futureHref: "/products/greases",
    productIds: [
      "mastermax-mp3-chassis-grease",
      "mastermax-ep3-crusher-grease",
      "mastermax-high-temperature-bearing-grease",
      "mastermax-ep00-liquid-grease",
    ],
  }),
];

export type ProvisionalCatalogueEntry = {
  brand: string;
  category: string;
  sourceStatus: CatalogueSourceStatus;
  verificationRequired: true;
  notes: string;
};

export const simbaCoolantEntry: ProvisionalCatalogueEntry = {
  brand: "Simba",
  category: "Coolants",
  sourceStatus: "relationship-unconfirmed",
  verificationRequired: true,
  notes:
    "The supplied catalogue uses Simba branding for coolant products; its relationship to Haribol Lubes Limited is not yet confirmed.",
};
