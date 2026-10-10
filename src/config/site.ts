export const siteConfig = {
  companyName: "Haribol Lubes Limited",
  shortName: "Haribol Lubes",
  country: "Kenya",
  city: "Mlolongo",
  intendedDomain: "https://haribollubesltd.co.ke",
  phone: "",
  // Optional human-friendly number, for example "+254 …". It is validated before use.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+254 794 205 115",
  publicEmail: "",
  businessAddress: {
    venue: "Emerald Business Park",
    street: "Kutch Rd",
    locality: "Mlolongo",
    country: "Kenya",
    formatted: "Emerald Business Park, Kutch Rd, Mlolongo, Kenya",
    mapsUrl:
      "https://www.google.com/maps/place//data=!4m2!3m1!1s0x182f0dcd36319d7f:0xc65af6db9c9cc271?sa=X&ved=1t:8290&ictx=111",
  },
  businessHours: "",
  socialLinks: {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  },
  defaultCurrency: "KES",
  commerceEnabled: false,
  domain: "https://haribollubesltd.co.ke",
  defaultSeoTitle:
    "Haribol Lubes Limited | Automotive & Industrial Lubricants Kenya",
  defaultSeoDescription:
    "Haribol Lubes Limited imports and distributes automotive and industrial lubricants from Mlolongo, Kenya.",
} as const;

export type SiteConfig = typeof siteConfig;
