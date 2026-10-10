import { siteConfig } from "@/config/site";

export function isStorefrontTestMode(): boolean {
  return process.env.STOREFRONT_TEST_MODE === "true";
}

export function isStorefrontEnabled(): boolean {
  return siteConfig.commerceEnabled || isStorefrontTestMode();
}
