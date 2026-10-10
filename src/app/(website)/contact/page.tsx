import { ContactPageContent } from "@/components/contact/contact-page";
import { createMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbSchema, createPageSchema, createSchemaGraph, JsonLd } from "@/lib/seo/structured-data";

export const metadata = createMetadata({
  absoluteTitle: "Contact Haribol Lubes Limited | Mlolongo, Kenya",
  description:
    "Contact Haribol Lubes Limited in Mlolongo for automotive and industrial lubricant enquiries, Mastermax products, product selection and commercial quotation requests.",
  path: "/contact",
});

export default function ContactPage() {
  return <><JsonLd data={createSchemaGraph([
    createPageSchema({ type: "ContactPage", path: "/contact", name: "Contact Haribol Lubes Limited", description: "Contact Haribol Lubes Limited for lubricant enquiries and product selection support." }),
    createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]),
  ])} /><ContactPageContent /></>;
}
