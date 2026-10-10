import { s3Storage } from "@payloadcms/storage-s3";
import type { Plugin } from "payload";

import { getStorageConfig, type S3BucketConfig } from "./config";

const s3ClientConfig = (bucket: S3BucketConfig) => ({
  credentials: {
    accessKeyId: bucket.accessKeyId,
    secretAccessKey: bucket.secretAccessKey,
  },
  endpoint: bucket.endpoint,
  forcePathStyle: bucket.forcePathStyle,
  region: bucket.region,
});

export function createStoragePlugins(): Plugin[] {
  const storage = getStorageConfig();
  const enabled = storage.provider === "railway-s3";
  const publicMedia = enabled ? storage.publicMedia : undefined;
  const privateDocuments = enabled ? storage.privateDocuments : undefined;

  return [
    s3Storage({
      alwaysInsertFields: true,
      bucket: publicMedia?.bucket || "local-public-media",
      clientCacheKey: "haribol-public-media",
      collections: { media: { prefix: "media" } },
      config: publicMedia ? s3ClientConfig(publicMedia) : { region: "auto" },
      enabled,
    }),
    s3Storage({
      alwaysInsertFields: true,
      bucket: privateDocuments?.bucket || "local-private-documents",
      clientCacheKey: "haribol-private-documents",
      collections: { "private-documents": { prefix: "private-documents" } },
      config: privateDocuments ? s3ClientConfig(privateDocuments) : { region: "auto" },
      enabled,
    }),
  ];
}
