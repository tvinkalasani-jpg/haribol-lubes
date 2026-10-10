import type { Brand } from "@/data/brands";
import type { Application, Market, Product, ProductCategory, Specification } from "@/types/product";

export type CatalogueSnapshot = {
  applications: readonly Application[];
  brands: readonly Brand[];
  categories: readonly ProductCategory[];
  markets: readonly Market[];
  products: readonly Product[];
  specifications: readonly Specification[];
};

export interface CatalogueRepository {
  getSnapshot(): Promise<CatalogueSnapshot>;
}
