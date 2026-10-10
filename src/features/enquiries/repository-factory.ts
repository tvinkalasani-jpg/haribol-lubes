import { assertCmsEnvironment } from "@/cms/environment";

import { FilesystemEnquiryRepository } from "./filesystem-repository";
import { PayloadEnquiryRepository } from "./payload-repository";
import type { EnquiryRepository } from "./repository";

export function createEnquiryRepository(): EnquiryRepository {
  const selected = process.env.RFQ_REPOSITORY || (process.env.NODE_ENV === "production" ? "payload" : "filesystem");
  if (selected === "filesystem") {
    if (process.env.NODE_ENV === "production") throw new Error("RFQ_REPOSITORY=filesystem is not permitted in production.");
    return new FilesystemEnquiryRepository();
  }
  if (selected === "payload") { assertCmsEnvironment(); return new PayloadEnquiryRepository(); }
  throw new Error("RFQ_REPOSITORY must be either 'filesystem' or 'payload'.");
}
