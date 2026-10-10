export type ProductCategoryVisual =
  | "engine"
  | "gear"
  | "transmission"
  | "hydraulic"
  | "industrial"
  | "grease"
  | "specialty";

export type ProductCategory = {
  description: string;
  href: string;
  index: string;
  name: string;
  visual: ProductCategoryVisual;
};

export const productCategories = [
  {
    index: "01",
    name: "Engine Oils",
    description:
      "Lubrication solutions for petrol, diesel and commercial engine applications.",
    href: "/products/engine-oils",
    visual: "engine",
  },
  {
    index: "02",
    name: "Gear Oils",
    description: "Lubricants for gear systems and driveline applications.",
    href: "/products/transmission-gear-oils",
    visual: "gear",
  },
  {
    index: "03",
    name: "Transmission Fluids",
    description: "Fluids for automotive transmission and power-transfer systems.",
    href: "/products/transmission-gear-oils",
    visual: "transmission",
  },
  {
    index: "04",
    name: "Hydraulic Oils",
    description: "Fluids for hydraulic systems in industrial and mobile equipment.",
    href: "/products/hydraulic-oils",
    visual: "hydraulic",
  },
  {
    index: "05",
    name: "Industrial Lubricants",
    description: "Lubrication products for machinery, equipment and industrial systems.",
    href: "/products/industrial-lubricants",
    visual: "industrial",
  },
  {
    index: "06",
    name: "Greases",
    description: "Lubricating greases for automotive and industrial applications.",
    href: "/products/greases",
    visual: "grease",
  },
  {
    index: "07",
    name: "Specialty Fluids",
    description: "Purpose-specific fluids for selected automotive and industrial uses.",
    href: "/products/specialty-fluids",
    visual: "specialty",
  },
] as const satisfies readonly ProductCategory[];

export type ProductCategorySlug = (typeof productCategories)[number]["href"] extends `/products/${infer Slug}`
  ? Slug
  : never;
