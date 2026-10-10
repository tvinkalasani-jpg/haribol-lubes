import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
execFileSync(process.execPath, [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.storage-tests.json"], { cwd: root, stdio: "inherit" });
const build = path.join(root, ".storage-test-build");
writeFileSync(path.join(build, "package.json"), '{"type":"commonjs"}\n');
const require = createRequire(import.meta.url);
const { getStorageConfig, storageObjectKey } = require(path.join(build, "config.js"));

const complete = {
  MEDIA_STORAGE_PROVIDER: "railway-s3",
  S3_ENDPOINT: "https://media.storageapi.dev",
  S3_ACCESS_KEY_ID: "public-key",
  S3_SECRET_ACCESS_KEY: "public-secret",
  S3_BUCKET: "public-media-example",
  S3_REGION: "auto",
  S3_FORCE_PATH_STYLE: "false",
  PRIVATE_S3_ENDPOINT: "https://private.storageapi.dev",
  PRIVATE_S3_ACCESS_KEY_ID: "private-key",
  PRIVATE_S3_SECRET_ACCESS_KEY: "private-secret",
  PRIVATE_S3_BUCKET: "private-documents-example",
  PRIVATE_S3_REGION: "auto",
};

let passed = 0;
const test = (name, check) => {
  check();
  passed += 1;
  console.info(`PASS ${String(passed).padStart(2, "0")} ${name}`);
};

test("local storage is the safe default", () => assert.deepEqual(getStorageConfig({}), { provider: "local" }));
test("Railway S3 provider is selected explicitly", () => assert.equal(getStorageConfig(complete).provider, "railway-s3"));
test("public media uses its own bucket", () => assert.equal(getStorageConfig(complete).publicMedia.bucket, "public-media-example"));
test("private documents use a separate bucket", () => assert.equal(getStorageConfig(complete).privateDocuments.bucket, "private-documents-example"));
test("current Railway virtual-hosted style maps to false", () => assert.equal(getStorageConfig(complete).publicMedia.forcePathStyle, false));
test("legacy path style remains configurable", () => assert.equal(getStorageConfig({ ...complete, S3_FORCE_PATH_STYLE: "true" }).privateDocuments.forcePathStyle, true));
test("incomplete object-storage credentials fail closed", () => assert.throws(() => getStorageConfig({ ...complete, PRIVATE_S3_SECRET_ACCESS_KEY: "" }), /PRIVATE_S3_SECRET_ACCESS_KEY/));
test("invalid path-style configuration fails closed", () => assert.throws(() => getStorageConfig({ ...complete, S3_FORCE_PATH_STYLE: "maybe" }), /true or false/));
test("object keys preserve the controlled prefix", () => assert.equal(storageObjectKey("private-documents", "guide.pdf"), "private-documents/guide.pdf"));
test("object keys reject traversal", () => assert.throws(() => storageObjectKey("private-documents/..", "guide.pdf"), /Invalid/));

const collections = readFileSync(path.join(root, "src/cms/collections.ts"), "utf8");
const storagePlugin = readFileSync(path.join(root, "src/lib/storage/payload-storage.ts"), "utf8");
const resourceRoute = readFileSync(path.join(root, "src/app/(website)/api/resources/[slug]/file/route.ts"), "utf8");
const adapterHook = readFileSync(path.join(root, "node_modules/@payloadcms/storage-s3/dist/index.js"), "utf8");
const storageRequire = createRequire(require.resolve("@payloadcms/storage-s3"));
const cloudHookPath = path.join(path.dirname(storageRequire.resolve("@payloadcms/plugin-cloud-storage")), "hooks/afterChange.js");
const cloudHook = readFileSync(cloudHookPath, "utf8");

test("private uploads accept PDF only", () => assert.match(collections, /slug: "private-documents"[\s\S]*?mimeTypes: \["application\/pdf"\]/));
test("arbitrary SVG uploads remain disabled", () => assert.doesNotMatch(collections, /image\/svg\+xml|image\/\*/));
test("both buckets use Payload access control", () => assert.doesNotMatch(storagePlugin, /disablePayloadAccessControl|generateFileURL/));
test("private objects are not exposed by a predictable storage URL", () => assert.doesNotMatch(resourceRoute, /PRIVATE_S3_ENDPOINT|GetObjectCommand|presign/));
test("resource delivery repeats private verification", () => assert.match(resourceRoute, /privateDocument\.verificationStatus !== "verified"/));
test("resource delivery no longer reads from the public media directory", () => assert.doesNotMatch(resourceRoute, /path\.join\(process\.cwd\(\), "media"/));
test("the official adapter disables local storage when enabled", () => assert.match(adapterHook, /disableLocalStorage: true/));
test("object upload errors propagate so the Payload transaction cannot report success", () => assert.match(cloudHook, /catch \(err\)[\s\S]*throw err/));

console.info(`\nRailway object-storage validation complete: ${passed} checks passed.`);
