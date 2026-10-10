import { getPayload } from "payload";

import config from "@payload-config";
import { assertCmsEnvironment } from "@/cms/environment";

import { mapCmsCatalogue, type CmsCatalogueDocuments } from "./cms-domain-mapper";
import type { CatalogueRepository } from "./catalogue-repository";

export class PayloadCatalogueRepository implements CatalogueRepository {
  async getSnapshot() {
    assertCmsEnvironment();
    const payload = await getPayload({ config });
    const [brands, categories, products, variants, applications, specifications, markets] = await Promise.all([
      payload.find({ collection: "brands", depth: 1, limit: 100, overrideAccess: true }), payload.find({ collection: "product-categories", depth: 1, limit: 100, overrideAccess: true }),
      payload.find({ collection: "products", depth: 1, limit: 500, overrideAccess: true }), payload.find({ collection: "product-variants", depth: 1, limit: 2000, overrideAccess: true }),
      payload.find({ collection: "applications", depth: 0, limit: 500, overrideAccess: true }), payload.find({ collection: "specifications", depth: 0, limit: 500, overrideAccess: true }), payload.find({ collection: "markets", depth: 0, limit: 100, overrideAccess: true }),
    ]);
    return mapCmsCatalogue({ brands: brands.docs, categories: categories.docs, products: products.docs, variants: variants.docs, applications: applications.docs, specifications: specifications.docs, markets: markets.docs } as unknown as CmsCatalogueDocuments);
  }
}
