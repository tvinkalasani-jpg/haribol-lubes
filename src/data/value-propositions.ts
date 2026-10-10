export type ValueProposition = {
  code: string;
  description: string;
  id: string;
  title: string;
};

export const valuePropositions = [
  {
    id: "01",
    code: "LOCAL",
    title: "Kenya-Based",
    description:
      "Commercial enquiries and lubricant supply coordinated from Mlolongo.",
  },
  {
    id: "02",
    code: "RANGE",
    title: "Automotive & Industrial",
    description:
      "Product categories structured for vehicles, machinery and industrial applications.",
  },
  {
    id: "03",
    code: "SOURCE",
    title: "International Sourcing",
    description:
      "Products sourced through overseas manufacturing and supply networks.",
  },
  {
    id: "04",
    code: "TRADE",
    title: "Bulk & Commercial Enquiries",
    description:
      "Enquiry support for business customers, fleets, workshops, resellers and industrial buyers.",
  },
  {
    id: "05",
    code: "SELECT",
    title: "Application-Led Selection",
    description:
      "Product discovery organised around equipment, use case and technical requirement.",
  },
  {
    id: "06",
    code: "DIRECT",
    title: "Direct Sales Access",
    description:
      "Clear routes to quotation and direct sales enquiries.",
  },
] as const satisfies readonly ValueProposition[];
