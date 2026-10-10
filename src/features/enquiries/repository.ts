import type { RfqNotificationStatus, RfqRecord } from "../../types/enquiry";

export type NewRfqRecord = Omit<RfqRecord, "id" | "referenceNumber" | "createdAt" | "updatedAt">;

export interface EnquiryRepository {
  create(record: NewRfqRecord): Promise<RfqRecord>;
  findById(id: string): Promise<RfqRecord | null>;
  findByIdempotencyKey(key: string): Promise<RfqRecord | null>;
  updateNotificationStatus(id: string, status: RfqNotificationStatus, attempts: number): Promise<RfqRecord>;
}

export class EnquiryStorageError extends Error {
  constructor(message = "Enquiry persistence failed.") {
    super(message);
    this.name = "EnquiryStorageError";
  }
}
