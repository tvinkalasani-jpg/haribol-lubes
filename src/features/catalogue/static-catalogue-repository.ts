import { brands } from "@/data/brands";
import { applications } from "@/data/catalogue/applications";
import { catalogueCategories } from "@/data/catalogue/categories";
import { markets } from "@/data/catalogue/markets";
import { products } from "@/data/catalogue/products";
import { specifications } from "@/data/catalogue/specifications";

import type { CatalogueRepository, CatalogueSnapshot } from "./catalogue-repository";

export class StaticCatalogueRepository implements CatalogueRepository {
  async getSnapshot(): Promise<CatalogueSnapshot> {
    return { applications, brands, categories: catalogueCategories, markets, products, specifications };
  }
}
