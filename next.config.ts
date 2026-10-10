import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import path from "node:path";

import { siteConfig } from "./src/config/site";
import { securityHeaders } from "./src/lib/security/headers";

const storefrontProductSlot = siteConfig.commerceEnabled || process.env.STOREFRONT_TEST_MODE === "true"
  ? "./src/features/storefront/product-slot.enabled.tsx"
  : "./src/features/storefront/product-slot.disabled.tsx";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  experimental: { globalNotFound: true },
  async headers() {
    const baseline = securityHeaders();
    return [
      { source: "/:path*", headers: baseline },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  turbopack: {
    resolveAlias: {
      "@storefront-product-slot": storefrontProductSlot,
    },
  },
  webpack(config) {
    config.resolve.alias["@storefront-product-slot"] = path.resolve(storefrontProductSlot);
    return config;
  },
};

export default withPayload(nextConfig);
