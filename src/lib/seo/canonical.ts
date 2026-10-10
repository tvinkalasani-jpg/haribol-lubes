import { siteConfig } from "@/config/site";

export function getSiteUrl(): URL | undefined {
  if (!siteConfig.domain) {
    return undefined;
  }

  try {
    return new URL(siteConfig.domain);
  } catch {
    return undefined;
  }
}

export function createCanonicalUrl(path = "/"): string | undefined {
  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    return undefined;
  }

  const pathname = new URL(path, siteUrl).pathname || "/";
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  return new URL(normalizedPath, siteUrl).toString();
}
