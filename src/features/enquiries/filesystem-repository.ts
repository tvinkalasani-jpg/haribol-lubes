import { randomBytes, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { copyFile, mkdir, open, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { RfqNotificationStatus, RfqRecord } from "../../types/enquiry";
import { EnquiryStorageError, type EnquiryRepository, type NewRfqRecord } from "./repository";

type AtomicReplaceOperations = {
  copyFile: typeof copyFile;
  open: typeof open;
  readFile: typeof readFile;
  rename: typeof rename;
  rm: typeof rm;
};

const atomicReplaceOperations: AtomicReplaceOperations = { copyFile, open, readFile, rename, rm };
const replacementConflictCodes = new Set(["EACCES", "EEXIST", "EPERM"]);

function errorCode(error: unknown) {
  return error instanceof Error && "code" in error ? String(error.code) : "";
}

/**
 * Replaces one record from a same-directory temporary file.
 *
 * POSIX rename-over-existing remains the fast, atomic path. Windows can reject
 * that operation with EPERM, so the fallback first verifies a backup copy,
 * installs and verifies the temporary file, and only then removes the backup.
 */
export async function replaceFileAtomically(
  destinationPath: string,
  contents: string,
  operationOverrides: Partial<AtomicReplaceOperations> = {},
) {
  const operations = { ...atomicReplaceOperations, ...operationOverrides };
  const operationId = randomUUID();
  const temporaryPath = `${destinationPath}.${operationId}.tmp`;
  const backupPath = `${destinationPath}.${operationId}.bak`;
  let backupOwnsExistingData = false;
  let operationError: unknown;

  try {
    const handle = await operations.open(temporaryPath, "wx", 0o600);
    try {
      await handle.writeFile(contents, { encoding: "utf8" });
      await handle.sync();
    } finally {
      await handle.close();
    }

    try {
      await operations.rename(temporaryPath, destinationPath);
      return;
    } catch (error) {
      if (!replacementConflictCodes.has(errorCode(error))) throw error;
    }

    const originalContents = await operations.readFile(destinationPath);
    await operations.copyFile(destinationPath, backupPath, constants.COPYFILE_EXCL);
    const backupContents = await operations.readFile(backupPath);
    if (!originalContents.equals(backupContents)) throw new Error("RFQ record backup verification failed.");
    await operations.rm(destinationPath);
    backupOwnsExistingData = true;

    try {
      await operations.copyFile(temporaryPath, destinationPath, constants.COPYFILE_EXCL);
      const installedContents = await operations.readFile(destinationPath);
      const temporaryContents = await operations.readFile(temporaryPath);
      if (!temporaryContents.equals(installedContents)) throw new Error("RFQ record replacement verification failed.");
    } catch (replacementError) {
      try {
        await operations.rm(destinationPath, { force: true });
        await operations.copyFile(backupPath, destinationPath, constants.COPYFILE_EXCL);
        const restoredContents = await operations.readFile(destinationPath);
        if (!backupContents.equals(restoredContents)) throw new Error("RFQ record restoration verification failed.");
        backupOwnsExistingData = false;
      } catch (restoreError) {
        throw new AggregateError(
          [replacementError, restoreError],
          "Atomic replacement failed and the original record remains in its backup file.",
        );
      }
      throw replacementError;
    }

    backupOwnsExistingData = false;
    await operations.rm(backupPath, { force: true });
  } catch (error) {
    operationError = error;
    throw error;
  } finally {
    const cleanupErrors: unknown[] = [];
    try { await operations.rm(temporaryPath, { force: true }); }
    catch (error) { cleanupErrors.push(error); }
    if (!backupOwnsExistingData) {
      try { await operations.rm(backupPath, { force: true }); }
      catch (error) { cleanupErrors.push(error); }
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        operationError ? [operationError, ...cleanupErrors] : cleanupErrors,
        "RFQ record replacement cleanup failed.",
      );
    }
  }
}

export class FilesystemEnquiryRepository implements EnquiryRepository {
  private readonly updateQueues = new Map<string, Promise<void>>();

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
    const previous = this.updateQueues.get(id) ?? Promise.resolve();
    let releaseQueue: () => void = () => undefined;
    const queueGate = new Promise<void>((resolve) => { releaseQueue = resolve; });
    const queued = previous.then(() => queueGate);
    this.updateQueues.set(id, queued);

    await previous;
    try {
      const existing = await this.findById(id);
      if (!existing) throw new EnquiryStorageError("Enquiry record was not found.");
      const updated = { ...existing, notificationStatus: status, notificationAttempts: attempts, updatedAt: new Date().toISOString() };
      await replaceFileAtomically(this.filePath(id), `${JSON.stringify(updated, null, 2)}\n`);
      return updated;
    } catch (error) {
      if (error instanceof EnquiryStorageError) throw error;
      throw new EnquiryStorageError();
    } finally {
      releaseQueue();
      if (this.updateQueues.get(id) === queued) this.updateQueues.delete(id);
    }
  }
}
