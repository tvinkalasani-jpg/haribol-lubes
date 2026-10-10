import { brands } from "@/data/brands";
import { applications } from "@/data/catalogue/applications";
import { catalogueCategories } from "@/data/catalogue/categories";
import { products } from "@/data/catalogue/products";
import { specifications } from "@/data/catalogue/specifications";
import { industries } from "@/data/industries";
import { getProductPath } from "@/features/catalogue/product-page-data";
import type { Product } from "@/types/product";

export const catalogueFilterKeys = [
  "brand",
  "category",
  "application",
  "grade",
  "specification",
  "industry",
] as const;

export type CatalogueFilterKey = (typeof catalogueFilterKeys)[number];

export type CatalogueSearchState = {
  query: string;
  filters: Record<CatalogueFilterKey, readonly string[]>;
};

export type CatalogueSearchRecord = {
  id: string;
  name: string;
  slug: string;
  href: string;
  description: string;
  productFamily?: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  variantNames: readonly string[];
  viscosityGrades: readonly string[];
  specificationIds: readonly string[];
  specificationCodes: readonly string[];
  applicationIds: readonly string[];
  applicationNames: readonly string[];
  industryIds: readonly string[];
  industryNames: readonly string[];
  marketIds: readonly string[];
  keywords: readonly string[];
  image: { src: string; alt: string } | null;
  catalogueOrder: number;
};

export type CatalogueFacetOption = {
  value: string;
  label: string;
  count: number;
};

export type CatalogueFilterGroup = {
  key: CatalogueFilterKey;
  label: string;
  options: readonly CatalogueFacetOption[];
};

export type CatalogueSearchDataset = {
  records: readonly CatalogueSearchRecord[];
  filterGroups: readonly CatalogueFilterGroup[];
  marketIds: readonly string[];
  includesUnpublished: boolean;
};

export type CatalogueSearchResult = {
  record: CatalogueSearchRecord;
  score: number;
  matchedOn?: string;
};

export const emptyCatalogueSearchState: CatalogueSearchState = {
  query: "",
  filters: {
    brand: [],
    category: [],
    application: [],
    grade: [],
    specification: [],
    industry: [],
  },
};

function uniqueValues(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function countValues(records: readonly CatalogueSearchRecord[], select: (record: CatalogueSearchRecord) => readonly string[]) {
  const counts = new Map<string, number>();

  records.forEach((record) => {
    uniqueValues(select(record)).forEach((value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
  });

  return counts;
}

function createOptions(
  records: readonly CatalogueSearchRecord[],
  values: readonly { value: string; label: string }[],
  select: (record: CatalogueSearchRecord) => readonly string[],
): readonly CatalogueFacetOption[] {
  const counts = countValues(records, select);

  return values.flatMap(({ value, label }) => {
    const count = counts.get(value) ?? 0;
    return count > 0 ? [{ value, label, count }] : [];
  });
}

function createSearchRecord(product: Product, catalogueOrder: number): CatalogueSearchRecord | undefined {
  const brand = brands.find((entry) => entry.id === product.brandId);
  const category = catalogueCategories.find((entry) => entry.id === product.primaryCategoryId);

  if (!brand || !category) {
    return undefined;
  }

  const specificationIds = uniqueValues([
    ...product.specificationIds,
    ...product.variants.flatMap((variant) => variant.specificationIds ?? []),
  ]);
  const applicationRecords = applications.filter((application) =>
    product.applicationIds.includes(application.id),
  );
  const industryRecords = industries.filter((industry) => product.industryIds.includes(industry.id));
  const image = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    href: getProductPath(product),
    description: product.shortDescription,
    productFamily: product.productFamily,
    brandId: brand.id,
    brandName: brand.name,
    categoryId: category.id,
    categoryName: category.name,
    variantNames: product.variants.map((variant) => variant.name),
    viscosityGrades: uniqueValues(
      product.variants.flatMap((variant) =>
        variant.viscosityGrade ? [variant.viscosityGrade.value] : [],
      ),
    ),
    specificationIds,
    specificationCodes: specifications
      .filter((specification) => specificationIds.includes(specification.id))
      .map((specification) => specification.code),
    applicationIds: product.applicationIds,
    applicationNames: applicationRecords.map((application) => application.name),
    industryIds: product.industryIds,
    industryNames: industryRecords.map((industry) => industry.name),
    marketIds: product.markets.map((market) => market.marketId),
    keywords: product.searchKeywords,
    image: image ? { src: image.src, alt: image.alt } : null,
    catalogueOrder,
  };
}

export function createCatalogueSearchDataset({
  includeUnpublished,
}: {
  includeUnpublished: boolean;
}): CatalogueSearchDataset {
  const searchableProducts = includeUnpublished
    ? products
    : products.filter(
        (product) => product.publicationStatus === "published" && product.seo.indexable,
      );
  const records = searchableProducts.flatMap((product, index) => {
    const record = createSearchRecord(product, index);
    return record ? [record] : [];
  });
  const gradeValues = uniqueValues(records.flatMap((record) => record.viscosityGrades));
  const marketIds = uniqueValues(records.flatMap((record) => record.marketIds));
  const filterGroups: readonly CatalogueFilterGroup[] = [
    {
      key: "brand",
      label: "Brand",
      options: createOptions(
        records,
        brands.map((brand) => ({ value: brand.id, label: brand.name })),
        (record) => [record.brandId],
      ),
    },
    {
      key: "category",
      label: "Category",
      options: createOptions(
        records,
        catalogueCategories.map((category) => ({ value: category.id, label: category.name })),
        (record) => [record.categoryId],
      ),
    },
    {
      key: "application",
      label: "Application",
      options: createOptions(
        records,
        applications.map((application) => ({ value: application.id, label: application.name })),
        (record) => record.applicationIds,
      ),
    },
    {
      key: "grade",
      label: "Viscosity / Grade",
      options: createOptions(
        records,
        gradeValues.map((grade) => ({ value: slugifyFacetValue(grade), label: grade })),
        (record) => record.viscosityGrades.map(slugifyFacetValue),
      ),
    },
    {
      key: "specification",
      label: "Specification / Classification",
      options: createOptions(
        records,
        specifications.map((specification) => ({
          value: specification.id,
          label: specification.code,
        })),
        (record) => record.specificationIds,
      ),
    },
    {
      key: "industry",
      label: "Industry",
      options: createOptions(
        records,
        industries.map((industry) => ({ value: industry.id, label: industry.name })),
        (record) => record.industryIds,
      ),
    },
  ];

  return {
    records,
    filterGroups: filterGroups.filter((group) => group.options.length > 0),
    marketIds,
    includesUnpublished: includeUnpublished,
  };
}

export function normalizeCatalogueQuery(value: string): string {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase("en")
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/[^a-z0-9/\-\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactTechnicalValue(value: string): string {
  return normalizeCatalogueQuery(value).replace(/[\s\-/]+/g, "");
}

export function slugifyFacetValue(value: string): string {
  return normalizeCatalogueQuery(value)
    .replace(/\//g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function fieldMatch(
  query: string,
  compactQuery: string,
  values: readonly string[],
): string | undefined {
  return values.find((value) => {
    const normalizedValue = normalizeCatalogueQuery(value);
    const tokens = query.split(" ").filter(Boolean);
    return (
      normalizedValue.includes(query) ||
      tokens.every((token) => normalizedValue.includes(token)) ||
      compactTechnicalValue(value).includes(compactQuery)
    );
  });
}

function rankRecord(record: CatalogueSearchRecord, query: string): { score: number; matchedOn?: string } {
  if (!query) {
    return { score: 0 };
  }

  const compactQuery = compactTechnicalValue(query);
  const normalizedName = normalizeCatalogueQuery(record.name);
  const normalizedFamily = normalizeCatalogueQuery(record.productFamily ?? "");
  const queryTokens = query.split(" ").filter(Boolean);

  if (normalizedName === query || normalizedFamily === query) {
    return { score: 1000, matchedOn: record.name };
  }
  if (normalizedName.includes(query) || normalizedFamily.includes(query)) {
    return { score: 850, matchedOn: record.name };
  }
  if (queryTokens.every((token) => normalizedName.includes(token))) {
    return { score: 700, matchedOn: record.name };
  }

  const rankedFields: readonly [number, readonly string[]][] = [
    [600, record.variantNames],
    [500, [record.brandName]],
    [450, [record.categoryName]],
    [400, record.viscosityGrades],
    [375, record.specificationCodes],
    [300, record.applicationNames],
    [250, record.industryNames],
    [200, record.keywords],
  ];

  for (const [score, values] of rankedFields) {
    const match = fieldMatch(query, compactQuery, values);
    if (match) {
      return { score, matchedOn: match };
    }
  }

  return { score: 0 };
}

function matchesFilters(record: CatalogueSearchRecord, state: CatalogueSearchState): boolean {
  const recordValues: Record<CatalogueFilterKey, readonly string[]> = {
    brand: [record.brandId],
    category: [record.categoryId],
    application: record.applicationIds,
    grade: record.viscosityGrades.map(slugifyFacetValue),
    specification: record.specificationIds,
    industry: record.industryIds,
  };

  return catalogueFilterKeys.every((key) => {
    const selectedValues = state.filters[key];
    return (
      selectedValues.length === 0 ||
      selectedValues.some((selectedValue) => recordValues[key].includes(selectedValue))
    );
  });
}

export function searchCatalogue(
  records: readonly CatalogueSearchRecord[],
  state: CatalogueSearchState,
): readonly CatalogueSearchResult[] {
  const query = normalizeCatalogueQuery(state.query);

  return records
    .filter((record) => matchesFilters(record, state))
    .map((record) => ({ record, ...rankRecord(record, query) }))
    .filter((result) => !query || result.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.record.catalogueOrder - b.record.catalogueOrder,
    );
}

export function hasActiveCatalogueState(state: CatalogueSearchState): boolean {
  return (
    Boolean(state.query.trim()) ||
    catalogueFilterKeys.some((key) => state.filters[key].length > 0)
  );
}

export function parseCatalogueSearchParams(
  params: URLSearchParams | Record<string, string | readonly string[] | undefined>,
): CatalogueSearchState {
  const getAll = (key: string): readonly string[] => {
    if (params instanceof URLSearchParams) {
      return params.getAll(key);
    }
    const value = params[key];
    return typeof value === "string" ? [value] : value ?? [];
  };
  const queryValues = getAll("q");

  return {
    query: queryValues[0] ?? "",
    filters: Object.fromEntries(
      catalogueFilterKeys.map((key) => [key, uniqueValues(getAll(key))]),
    ) as Record<CatalogueFilterKey, readonly string[]>,
  };
}

export function createCatalogueSearchParams(state: CatalogueSearchState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.query.trim()) {
    params.set("q", state.query.trim());
  }
  catalogueFilterKeys.forEach((key) => {
    state.filters[key].forEach((value) => params.append(key, value));
  });

  return params;
}
