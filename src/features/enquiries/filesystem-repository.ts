import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { RfqNotificationStatus, RfqRecord } from "../../types/enquiry";
import { EnquiryStorageError, type EnquiryRepository, type NewRfqRecord } from "./repository";

export class FilesystemEnquiryRepository implements EnquiryRepository {
  constructor(private readonly directory = process.env.RFQ_DATA_DIRECTORY || path.join(process.cwd(), ".data", "rfq-enquiries")) {}

  private async ensureDirectory() { await mkdir(this.directory, { recursive: true }); }
  private filePath(id: string) { return path.join(this.directory, `${id}.json`); }

  async create(input: NewRfqRecord): Promise<RfqRecord> {
    try {
      await this.ensureDirectory();
      const existing = await this.findByIdempotencyKey(input.idempotencyKey);
      if (existing) return existing;

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const timestamp = new Date().toISOString();
        const record: RfqRecord = {
          ...input,
          id: randomUUID(),
          referenceNumber: `RFQ-${new Date().getUTCFullYear()}-${randomBytes(4).toString("hex").slice(0, 6).toUpperCase()}`,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        try {
          await writeFile(this.filePath(record.id), `${JSON.stringify(record, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
          return record;
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        }
      }
      throw new Error("Could not allocate a unique record.");
    } catch (error) {
      if (error instanceof EnquiryStorageError) throw error;
      throw new EnquiryStorageError(error instanceof Error ? error.message : undefined);
    }
  }

  async findById(id: string): Promise<RfqRecord | null> {
    try { return JSON.parse(await readFile(this.filePath(id), "utf8")) as RfqRecord; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw new EnquiryStorageError(); }
  }

  async findByIdempotencyKey(key: string): Promise<RfqRecord | null> {
    try {
      await this.ensureDirectory();
      const files = await readdir(this.directory);
      for (const filename of files.filter((entry) => entry.endsWith(".json"))) {
        const record = JSON.parse(await readFile(path.join(this.directory, filename), "utf8")) as RfqRecord;
        if (record.idempotencyKey === key) return record;
      }
      return null;
    } catch { throw new EnquiryStorageError(); }
  }

  async updateNotificationStatus(id: string, status: RfqNotificationStatus, attempts: number): Promise<RfqRecord> {
    const existing = await this.findById(id);
    if (!existing) throw new EnquiryStorageError("Enquiry record was not found.");
    const updated = { ...existing, notificationStatus: status, notificationAttempts: attempts, updatedAt: new Date().toISOString() };
    const temporaryPath = `${this.filePath(id)}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporaryPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
      await rename(temporaryPath, this.filePath(id));
      return updated;
    } catch { throw new EnquiryStorageError(); }
  }
}
