import { productCategories } from "./product-categories";

export const productNavigation = productCategories.map((category) => ({
  href: category.href,
  label: category.name,
}));

export const primaryNavigation = [
  { href: "/industries", label: "Industries" },
  { href: "/product-finder", label: "Product Finder" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
] as const;

export const siteNavigation = [
  { href: "/products", label: "Products" },
  ...primaryNavigation,
  { href: "/applications", label: "Applications" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
  { href: "/request-a-quote", label: "Request a Quote" },
] as const;
