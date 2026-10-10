import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const root = process.cwd();
const reportPath = resolve(root, process.env.SECURITY_OUTPUT_DIR || "../outputs/phase-29", "production-file-scan.json");
const publicRoots = [resolve(root, "public"), resolve(root, ".next/static")];
const serverRoot = resolve(root, ".next/server");
const textExtensions = new Set([".css", ".html", ".js", ".json", ".map", ".txt", ".xml"]);
const sensitivePatterns = [
  ["database credential", /postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@/i],
  ["local development secret", /phase25ea-local-development|phase-25-static-build-only-secret/i],
  ["seed administrator password", /PAYLOAD_SEED_ADMIN_PASSWORD\s*=\s*\S+/i],
  ["synthetic RFQ record", /RFQ-2026-[A-F0-9]{6}/],
  ["private API credential", /(?:EMAIL_API_KEY|R2_SECRET_ACCESS_KEY)\s*=\s*\S+/i],
];

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true }).catch(() => [])) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (entry.isFile() && textExtensions.has(extname(entry.name))) result.push(path);
  }
  return result;
}

const publicFiles = (await Promise.all(publicRoots.map(files))).flat();
const serverFiles = await files(serverRoot);
const findings = [];
for (const path of [...publicFiles, ...serverFiles]) {
  const size = (await stat(path)).size;
  if (size > 8_000_000) continue;
  const value = await readFile(path, "utf8").catch(() => "");
  for (const [kind, pattern] of sensitivePatterns) {
    if (pattern.test(value)) findings.push({ file: relative(root, path), kind });
  }
}
const publicSourceMaps = publicFiles.filter((path) => extname(path) === ".map").map((path) => relative(root, path));
const report = {
  clean: findings.length === 0 && publicSourceMaps.length === 0,
  scannedPublicFiles: publicFiles.length,
  scannedServerFiles: serverFiles.length,
  findings,
  publicSourceMaps,
  note: "Next.js server trace manifests contain local build-root paths by design; they are server packaging metadata and are not public client assets.",
};
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (!report.clean) process.exitCode = 1;
