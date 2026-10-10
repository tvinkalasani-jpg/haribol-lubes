import { applications } from "@/data/catalogue/applications";
import { products } from "@/data/catalogue/products";
import { specifications } from "@/data/catalogue/specifications";

import {
  createCatalogueSearchDataset,
  slugifyFacetValue,
  type CatalogueSearchRecord,
} from "./catalogue-search";

export type FinderTechnicalKind = "grade" | "specification";

export type FinderTechnicalOption = {
  kind: FinderTechnicalKind;
  value: string;
  label: string;
};

export type FinderRecord = Pick<
  CatalogueSearchRecord,
  | "id"
  | "name"
  | "slug"
  | "href"
  | "description"
  | "brandName"
  | "categoryId"
  | "categoryName"
  | "applicationIds"
  | "image"
  | "catalogueOrder"
> & {
  technicalOptions: readonly FinderTechnicalOption[];
};

export type FinderOption = {
  value: string;
  label: string;
  description?: string;
  count: number;
};

export type ProductFinderDataset = {
  records: readonly FinderRecord[];
  applications: readonly FinderOption[];
};

export type ProductFinderState = {
  application?: string;
  category?: string;
  technical?: FinderTechnicalOption;
  unsure: boolean;
};

export type ProductFinderResult = {
  record: FinderRecord;
  applicationLabel: string;
  technicalLabel?: string;
};

function uniqueOptions(options: readonly FinderTechnicalOption[]): readonly FinderTechnicalOption[] {
  return [...new Map(options.map((option) => [`${option.kind}:${option.value}`, option])).values()];
}

function createTechnicalOptions(record: CatalogueSearchRecord): readonly FinderTechnicalOption[] {
  const product = products.find((entry) => entry.id === record.id);
  if (!product) {
    return [];
  }

  const gradeOptions = product.variants.flatMap((variant) => {
    const grade = variant.viscosityGrade?.value;
    if (!grade) {
      return [];
    }

    return [{
      kind: "grade" as const,
      value: slugifyFacetValue(grade),
      label: product.primaryCategoryId === "compressor-oils" ? variant.name : grade,
    }];
  });
  const specificationOptions = record.specificationIds.flatMap((specificationId) => {
    const specification = specifications.find((entry) => entry.id === specificationId);
    return specification
      ? [{ kind: "specification" as const, value: specification.id, label: specification.code }]
      : [];
  });

  return uniqueOptions([...gradeOptions, ...specificationOptions]);
}

export function createProductFinderDataset({
  includeUnpublished,
}: {
  includeUnpublished: boolean;
}): ProductFinderDataset {
  const catalogue = createCatalogueSearchDataset({ includeUnpublished });
  const records = catalogue.records.map((record) => ({
    id: record.id,
    name: record.name,
    slug: record.slug,
    href: record.href,
    description: record.description,
    brandName: record.brandName,
    categoryId: record.categoryId,
    categoryName: record.categoryName,
    applicationIds: record.applicationIds,
    image: record.image,
    catalogueOrder: record.catalogueOrder,
    technicalOptions: createTechnicalOptions(record),
  }));
  const applicationOptions = applications.flatMap((application) => {
    const count = records.filter((record) => record.applicationIds.includes(application.id)).length;
    return count > 0
      ? [{
          value: application.id,
          label: application.name,
          description: application.description,
          count,
        }]
      : [];
  });

  return {
    records,
    applications: applicationOptions,
  };
}

export function getFinderCategoryOptions(
  dataset: ProductFinderDataset,
  applicationId: string,
): readonly FinderOption[] {
  const applicable = dataset.records.filter((record) =>
    record.applicationIds.includes(applicationId),
  );
  const categories = new Map<string, FinderOption>();

  applicable.forEach((record) => {
    const existing = categories.get(record.categoryId);
    categories.set(record.categoryId, {
      value: record.categoryId,
      label: record.categoryName,
      count: (existing?.count ?? 0) + 1,
    });
  });

  return [...categories.values()];
}

export function getFinderTechnicalOptions(
  dataset: ProductFinderDataset,
  applicationId: string,
  categoryId: string,
): readonly FinderTechnicalOption[] {
  const options = dataset.records
    .filter(
      (record) =>
        record.applicationIds.includes(applicationId) && record.categoryId === categoryId,
    )
    .flatMap((record) => record.technicalOptions);

  return [...uniqueOptions(options)].sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === "grade" ? -1 : 1;
    }
    return a.label.localeCompare(b.label, "en", { numeric: true });
  });
}

export function findProducts(
  dataset: ProductFinderDataset,
  state: ProductFinderState,
): readonly ProductFinderResult[] {
  if (!state.application || !state.category || (!state.unsure && !state.technical)) {
    return [];
  }

  const application = dataset.applications.find((option) => option.value === state.application);

  return dataset.records
    .filter(
      (record) =>
        record.applicationIds.includes(state.application ?? "") &&
        record.categoryId === state.category &&
        (state.unsure ||
          record.technicalOptions.some(
            (option) =>
              option.kind === state.technical?.kind && option.value === state.technical.value,
          )),
    )
    .map((record) => ({
      record,
      applicationLabel: application?.label ?? state.application ?? "",
      technicalLabel: state.unsure ? undefined : state.technical?.label,
    }))
    .sort((a, b) => a.record.catalogueOrder - b.record.catalogueOrder);
}

function firstParam(
  params: URLSearchParams | Record<string, string | readonly string[] | undefined>,
  key: string,
): string | undefined {
  if (params instanceof URLSearchParams) {
    return params.get(key) ?? undefined;
  }
  const value = params[key];
  return typeof value === "string" ? value : value?.[0];
}

export function parseProductFinderParams(
  params: URLSearchParams | Record<string, string | readonly string[] | undefined>,
): ProductFinderState {
  const grade = firstParam(params, "grade");
  const specification = firstParam(params, "specification");

  return {
    application: firstParam(params, "application"),
    category: firstParam(params, "category"),
    technical: grade
      ? { kind: "grade", value: grade, label: grade }
      : specification
        ? { kind: "specification", value: specification, label: specification }
        : undefined,
    unsure: firstParam(params, "unsure") === "1",
  };
}

export function hydrateProductFinderState(
  dataset: ProductFinderDataset,
  state: ProductFinderState,
): ProductFinderState {
  if (!state.technical) {
    return state;
  }

  const option = dataset.records
    .flatMap((record) => record.technicalOptions)
    .find(
      (entry) =>
        entry.kind === state.technical?.kind && entry.value === state.technical.value,
    );

  return { ...state, technical: option ?? state.technical };
}

export function createProductFinderParams(state: ProductFinderState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.application) {
    params.set("application", state.application);
  }
  if (state.category) {
    params.set("category", state.category);
  }
  if (state.unsure) {
    params.set("unsure", "1");
  } else if (state.technical) {
    params.set(state.technical.kind, state.technical.value);
  }
  return params;
}

export function hasProductFinderParams(state: ProductFinderState): boolean {
  return Boolean(state.application || state.category || state.technical || state.unsure);
}

export function getProductFinderStep(state: ProductFinderState): 1 | 2 | 3 | 4 {
  if (!state.application) {
    return 1;
  }
  if (!state.category) {
    return 2;
  }
  if (!state.technical && !state.unsure) {
    return 3;
  }
  return 4;
}
