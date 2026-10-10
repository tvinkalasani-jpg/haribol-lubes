export type StorageEnvironment = Record<string, string | undefined>;

export type S3BucketConfig = {
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  forcePathStyle: boolean;
  region: string;
  secretAccessKey: string;
};

export type StorageConfig =
  | { provider: "local" }
  | {
      privateDocuments: S3BucketConfig;
      provider: "railway-s3";
      publicMedia: S3BucketConfig;
    };

const required = (environment: StorageEnvironment, name: string): string => {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`Missing required object-storage variable: ${name}`);
  return value;
};

const parsePathStyle = (value: string | undefined): boolean => {
  if (!value || value === "false") return false;
  if (value === "true") return true;
  throw new Error("S3_FORCE_PATH_STYLE must be either true or false.");
};

const bucketConfig = (
  environment: StorageEnvironment,
  names: {
    accessKeyId: string;
    bucket: string;
    endpoint: string;
    region: string;
    secretAccessKey: string;
  },
  forcePathStyle: boolean,
): S3BucketConfig => ({
  accessKeyId: required(environment, names.accessKeyId),
  bucket: required(environment, names.bucket),
  endpoint: required(environment, names.endpoint),
  forcePathStyle,
  region: required(environment, names.region),
  secretAccessKey: required(environment, names.secretAccessKey),
});

export function getStorageConfig(environment: StorageEnvironment = process.env): StorageConfig {
  const provider = environment.MEDIA_STORAGE_PROVIDER?.trim() || "local";
  if (provider === "local") return { provider };
  if (provider !== "railway-s3") {
    throw new Error(`Unsupported MEDIA_STORAGE_PROVIDER: ${provider}`);
  }

  const forcePathStyle = parsePathStyle(environment.S3_FORCE_PATH_STYLE);
  return {
    provider,
    publicMedia: bucketConfig(environment, {
      accessKeyId: "S3_ACCESS_KEY_ID",
      bucket: "S3_BUCKET",
      endpoint: "S3_ENDPOINT",
      region: "S3_REGION",
      secretAccessKey: "S3_SECRET_ACCESS_KEY",
    }, forcePathStyle),
    privateDocuments: bucketConfig(environment, {
      accessKeyId: "PRIVATE_S3_ACCESS_KEY_ID",
      bucket: "PRIVATE_S3_BUCKET",
      endpoint: "PRIVATE_S3_ENDPOINT",
      region: "PRIVATE_S3_REGION",
      secretAccessKey: "PRIVATE_S3_SECRET_ACCESS_KEY",
    }, forcePathStyle),
  };
}

export function storageObjectKey(prefix: string | null | undefined, filename: string): string {
  const safeFilename = filename.trim();
  if (!safeFilename || safeFilename.includes("/") || safeFilename.includes("\\") || safeFilename === "." || safeFilename === "..") {
    throw new Error("Invalid stored filename.");
  }

  const parts = (prefix || "").split("/").filter(Boolean);
  if (parts.some((part) => part === "." || part === ".." || !/^[a-zA-Z0-9._-]+$/.test(part))) {
    throw new Error("Invalid stored object prefix.");
  }
  return [...parts, safeFilename].join("/");
}
