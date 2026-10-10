import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { collections } from "./src/cms/collections";
import { cmsEnvironment } from "./src/cms/environment";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: "users",
    importMap: { baseDir: path.resolve(dirname, "src") },
    meta: { titleSuffix: " · Haribol CMS" },
  },
  collections,
  db: postgresAdapter({
    pool: { connectionString: cmsEnvironment.databaseUrl },
    migrationDir: path.resolve(dirname, "src/migrations"),
    push: process.env.NODE_ENV === "development",
  }),
  editor: lexicalEditor(),
  graphQL: { disable: true },
  onInit: async (payload) => {
    if (process.env.NODE_ENV !== "production") return;
    const users = await payload.count({ collection: "users", overrideAccess: true });
    const bootstrapAuthorized = process.env.ADMIN_BOOTSTRAP_MODE === "bootstrap"
      && Boolean(process.env.PAYLOAD_SEED_ADMIN_EMAIL && process.env.PAYLOAD_SEED_ADMIN_PASSWORD);
    if (users.totalDocs === 0 && process.env.ADMIN_BOOTSTRAP_MODE !== "allow-local" && !bootstrapAuthorized) {
      throw new Error("Production startup refused: create and verify an administrator before exposing Payload Admin.");
    }
  },
  secret: cmsEnvironment.secret,
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  sharp,
  typescript: { outputFile: path.resolve(dirname, "src/payload-types.ts") },
  upload: {
    abortOnLimit: true,
    limits: { fileSize: 15 * 1024 * 1024, files: 1 },
    safeFileNames: true,
  },
});
