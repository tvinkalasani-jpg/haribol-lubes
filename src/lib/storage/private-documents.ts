import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getStorageConfig, storageObjectKey } from "./config";

export type StoredPrivateDocument = {
  body: Uint8Array;
  contentType?: string;
};

export async function readPrivateDocument(
  filename: string,
  prefix?: string | null,
): Promise<StoredPrivateDocument | undefined> {
  const storage = getStorageConfig();
  if (storage.provider === "local") {
    const safeFilename = storageObjectKey(undefined, filename);
    const body = await readFile(path.join(process.cwd(), "private-documents", safeFilename)).catch(() => undefined);
    return body ? { body } : undefined;
  }

  const bucket = storage.privateDocuments;
  const client = new S3Client({
    credentials: { accessKeyId: bucket.accessKeyId, secretAccessKey: bucket.secretAccessKey },
    endpoint: bucket.endpoint,
    forcePathStyle: bucket.forcePathStyle,
    region: bucket.region,
  });
  try {
    const object = await client.send(new GetObjectCommand({
      Bucket: bucket.bucket,
      Key: storageObjectKey(prefix, filename),
    }));
    if (!object.Body) return undefined;
    return {
      body: await object.Body.transformToByteArray(),
      contentType: object.ContentType,
    };
  } catch (error) {
    if (error && typeof error === "object" && "name" in error && (error.name === "NoSuchKey" || error.name === "NotFound")) {
      return undefined;
    }
    throw error;
  } finally {
    client.destroy();
  }
}
