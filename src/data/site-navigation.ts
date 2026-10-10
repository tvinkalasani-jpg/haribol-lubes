import { productCategories } from "./product-categories";

export const productNavigation = productCategories.map((category) => ({
  href: category.href,
  label: category.name,
}));

export const primaryNavigation = [
  { href: "/industries", label: "Industries" },
  { href: "/applications", label: "Applications" },
  { href: "/resources", label: "Resources" },
  { href: "/insights", label: "Insights" },
  { href: "/about", label: "About" },
] as const;

export const siteNavigation = [
  { href: "/products", label: "Products" },
  ...primaryNavigation,
  { href: "/contact", label: "Contact" },
  { href: "/request-a-quote", label: "Request a Quote" },
] as const;
