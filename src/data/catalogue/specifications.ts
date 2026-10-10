import type { Specification } from "@/types/product";

const sourceReference = "Mastermax 2024 catalogue, pages 3 and 5.";

export const specifications: readonly Specification[] = [
  { id: "api-ch-4", code: "API CH-4", name: "API CH-4", kind: "performance-standard", issuingBody: "API", isApproval: false, verificationStatus: "catalogue-derived", sourceReference },
  { id: "api-ci-4", code: "API CI-4", name: "API CI-4", kind: "performance-standard", issuingBody: "API", isApproval: false, verificationStatus: "catalogue-derived", sourceReference },
  { id: "api-cj-4", code: "API CJ-4", name: "API CJ-4", kind: "performance-standard", issuingBody: "API", isApproval: false, verificationStatus: "catalogue-derived", sourceReference },
  { id: "api-sl-cf", code: "API SL/CF", name: "API SL/CF", kind: "performance-standard", issuingBody: "API", isApproval: false, verificationStatus: "catalogue-derived", sourceReference },
  { id: "api-sn-cf", code: "API SN/CF", name: "API SN/CF", kind: "performance-standard", issuingBody: "API", isApproval: false, verificationStatus: "catalogue-derived", sourceReference },
  { id: "gl-4", code: "GL-4", name: "API GL-4", kind: "transmission-classification", issuingBody: "API", isApproval: false, verificationStatus: "catalogue-derived", sourceReference },
  { id: "gl-5", code: "GL-5", name: "API GL-5", kind: "transmission-classification", issuingBody: "API", isApproval: false, verificationStatus: "catalogue-derived", sourceReference },
  { id: "dexron-ii", code: "Dexron II", name: "Dexron II", kind: "transmission-classification", isApproval: false, verificationStatus: "catalogue-derived", sourceReference },
  { id: "api-to-4", code: "API TO-4", name: "API TO-4", kind: "transmission-classification", issuingBody: "API", isApproval: false, verificationStatus: "catalogue-derived", sourceReference },
  { id: "api-mt-1", code: "API MT-1", name: "API MT-1", kind: "transmission-classification", issuingBody: "API", isApproval: false, verificationStatus: "catalogue-derived", sourceReference },
] as const;

export type SpecificationId = (typeof specifications)[number]["id"];
