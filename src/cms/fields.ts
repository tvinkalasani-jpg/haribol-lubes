import type { Field } from "payload";

export const verificationOptions = ["verified", "catalogue-derived", "needs-review", "unverified", "deprecated"] as const;
export const publicationOptions = ["draft", "published", "archived"] as const;

export const slugField: Field = {
  name: "slug",
  label: "URL Slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  validate: (value: unknown) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? true : "Use lowercase letters, numbers and single hyphens only.",
};

export const verificationStatusField: Field = {
  name: "verificationStatus",
  dbName: "verify_status",
  label: "Verification Status",
  type: "select",
  required: true,
  defaultValue: "needs-review",
  options: verificationOptions.map((value) => ({ label: value.replaceAll("-", " "), value })),
  admin: { description: "Technical verification state. This does not control whether the record is publicly published." },
};

export const publicationStatusField: Field = {
  name: "publicationStatus",
  dbName: "publish_status",
  label: "Publication Status",
  type: "select",
  required: true,
  defaultValue: "draft",
  index: true,
  options: publicationOptions.map((value) => ({ label: value[0]!.toUpperCase() + value.slice(1), value })),
  admin: { description: "Controls public publication separately from technical verification." },
};

export const seoFields: Field = {
  name: "seo",
  label: "SEO",
  type: "group",
  fields: [
    { name: "metaTitle", label: "Meta title", type: "text", maxLength: 70 },
    { name: "metaDescription", label: "Meta description", type: "textarea", maxLength: 170 },
    { name: "canonicalOverride", label: "Canonical URL override", type: "text", admin: { description: "Leave empty to use the established canonical route." } },
    { name: "indexable", label: "Allow search indexing", type: "checkbox", defaultValue: false },
    { name: "openGraphImage", label: "Open Graph image", type: "relationship", relationTo: "media" },
  ],
};
