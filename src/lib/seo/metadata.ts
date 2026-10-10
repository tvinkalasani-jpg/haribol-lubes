import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { createCanonicalUrl, getSiteUrl } from "@/lib/seo/canonical";
import { createRobots } from "@/lib/seo/environment";

type MetadataOptions = {
  title?: string;
  absoluteTitle?: string;
  description?: string;
  path?: string;
  indexable?: boolean;
  type?: "website" | "article";
};

export function createMetadata({
  title,
  absoluteTitle,
  description = siteConfig.defaultSeoDescription,
  path = "/",
  indexable = true,
  type = "website",
}: MetadataOptions = {}): Metadata {
  const resolvedTitle =
    absoluteTitle ??
    (title ? `${title} | ${siteConfig.shortName}` : siteConfig.defaultSeoTitle);
  const canonicalUrl = createCanonicalUrl(path);

  return {
    metadataBase: getSiteUrl(),
    title: absoluteTitle ? { absolute: absoluteTitle } : resolvedTitle,
    description,
    robots: createRobots(indexable),
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      type,
      locale: "en_KE",
      siteName: siteConfig.shortName,
      title: resolvedTitle,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary",
      title: resolvedTitle,
      description,
    },
  };
}

export const defaultMetadata = createMetadata();
