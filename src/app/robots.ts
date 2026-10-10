import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { isProductionIndexingEnabled } from "@/lib/seo/environment";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionIndexingEnabled()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/cart", "/checkout", "/design-system", "/preview/"],
    },
    sitemap: `${siteConfig.domain}/sitemap.xml`,
    host: siteConfig.domain,
  };
}
