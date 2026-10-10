import type { Metadata } from "next";

export function isProductionIndexingEnabled(): boolean {
  return process.env.SEO_INDEXING_MODE === "production";
}

export function createRobots(indexable = true): Metadata["robots"] {
  const production = isProductionIndexingEnabled();
  const canIndex = indexable && production;
  const canFollow = production;
  return {
    index: canIndex,
    follow: canFollow,
    googleBot: { index: canIndex, follow: canFollow },
  };
}
