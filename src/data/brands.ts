export type BrandStatus = "active" | "provisional" | "inactive";

export type BrandType = "owned" | "partner" | "distributed" | "unverified";

export type Brand = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  status: BrandStatus;
  featured: boolean;
  brandType: BrandType;
  futureHref: string;
  logoAsset?: string;
  brandAccent?: string;
  notes?: string;
};

export const mastermaxBrand: Brand = {
    id: "mastermax",
    slug: "mastermax",
    name: "Mastermax",
    shortDescription:
      "Automotive and industrial lubricant ranges for engine, hydraulic, transmission, compressor and industrial applications.",
    status: "active",
    featured: true,
    brandType: "owned",
    futureHref: "/brands/mastermax",
    brandAccent: "#e46f24",
    notes:
      "The supplied catalogue identifies Mastermax as a registered trademark of Haribol Lubes Limited.",
};

export const brands: readonly Brand[] = [mastermaxBrand];

export const featuredBrand = mastermaxBrand;
