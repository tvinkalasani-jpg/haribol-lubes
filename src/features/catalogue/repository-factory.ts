import { getCatalogueDataSource } from "@/cms/environment";

import type { CatalogueRepository } from "./catalogue-repository";
import { PayloadCatalogueRepository } from "./payload-catalogue-repository";
import { StaticCatalogueRepository } from "./static-catalogue-repository";

export function createCatalogueRepository(): CatalogueRepository {
  return getCatalogueDataSource() === "cms" ? new PayloadCatalogueRepository() : new StaticCatalogueRepository();
}
