import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";

execFileSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.theme-tests.json"], { stdio: "inherit" });
await writeFile(new URL("../.theme-test-build/package.json", import.meta.url), '{"type":"commonjs"}\n');
const require = createRequire(import.meta.url);
const { normalizeThemeMode, themeInitializationScript, themeModes, themeStorageKey } = require("../.theme-test-build/theme.js");
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const tests = [];
const test = (name, run) => tests.push([name, run]);

function executeInitialization(storedValue) {
  const writes = [];
  const document = { documentElement: { dataset: {}, style: {} } };
  const localStorage = {
    getItem: () => storedValue,
    setItem: (key, value) => writes.push([key, value]),
  };
  Function("document", "localStorage", themeInitializationScript)(document, localStorage);
  return { root: document.documentElement, writes };
}

test("01 storage key remains stable", () => assert.equal(themeStorageKey, "haribol-theme"));
test("02 only Light and Dark are supported", () => assert.deepEqual(themeModes, ["light", "dark"]));
test("03 missing value defaults to Light", () => assert.equal(normalizeThemeMode(null), "light"));
test("04 malformed value defaults to Light", () => assert.equal(normalizeThemeMode("sepia"), "light"));
test("05 legacy System value defaults to Light", () => assert.equal(normalizeThemeMode("system"), "light"));
test("06 Light remains Light", () => assert.equal(normalizeThemeMode("light"), "light"));
test("07 Dark remains Dark", () => assert.equal(normalizeThemeMode("dark"), "dark"));
test("08 first visit initializes Light", () => assert.equal(executeInitialization(null).root.dataset.theme, "light"));
test("09 saved Dark initializes Dark", () => assert.equal(executeInitialization("dark").root.dataset.theme, "dark"));
test("10 legacy System initializes Light", () => assert.equal(executeInitialization("system").root.dataset.theme, "light"));
test("11 invalid stored value is repaired", () => assert.deepEqual(executeInitialization("system").writes, [[themeStorageKey, "light"]]));
test("12 initialization sets native colour scheme", () => assert.equal(executeInitialization("dark").root.style.colorScheme, "dark"));
test("13 initialization has no OS dependency", () => assert.doesNotMatch(themeInitializationScript, /matchMedia|prefers-color-scheme/));
test("14 initialization script stays constrained", () => assert.ok(Buffer.byteLength(themeInitializationScript) < 500));
test("15 website layout declares Light SSR default", async () => assert.match(await read("src/app/(website)/layout.tsx"), /data-theme="light" data-theme-preference="light"/));
test("16 global not-found declares Light SSR default", async () => assert.match(await read("src/app/global-not-found.tsx"), /data-theme="light" data-theme-preference="light"/));
test("17 Payload layout remains isolated", async () => assert.doesNotMatch(await read("src/app/(payload)/layout.tsx"), /theme|globals\.css/));
test("18 desktop control remains in header", async () => assert.match(await read("src/components/layout/site-header.tsx"), /placement="desktop"/));
test("19 mobile control remains in menu", async () => assert.match(await read("src/components/layout/site-header.tsx"), /placement="mobile"/));
test("20 control exposes pressed state and visible labels", async () => { const source = await read("src/components/ui/theme-control.tsx"); assert.match(source, /aria-pressed/); assert.match(source, /Light/); assert.match(source, /Dark/); assert.doesNotMatch(source, /matchMedia|System|menuitemradio/); });
test("21 control persists only selected modes", async () => assert.match(await read("src/components/ui/theme-control.tsx"), /localStorage\.setItem\(themeStorageKey, nextMode\)/));
test("22 CSS baseline is Light with an explicit Dark override", async () => { const source = await read("src/styles/tokens.css"); assert.match(source, /^:root \{/); assert.match(source, /\[data-theme="dark"\]/); assert.doesNotMatch(source, /prefers-color-scheme/); });
test("23 global CSS has no OS theme fallback", async () => assert.doesNotMatch(await read("src/styles/globals.css"), /prefers-color-scheme/));
test("24 semantic status and focus tokens remain available", async () => { const source = await read("src/styles/tokens.css"); assert.match(source, /--color-success:/); assert.match(source, /--color-danger:/); assert.match(source, /--color-focus:/); });
test("25 public commerce remains disabled", async () => { const config = await read("src/config/site.ts"); const gate = await read("src/features/storefront/config.ts"); assert.match(config, /commerceEnabled:\s*false/); assert.match(gate, /STOREFRONT_TEST_MODE\s*===\s*"true"/); });

let passed = 0;
for (const [name, run] of tests) {
  await run();
  console.log(`PASS ${name}`);
  passed++;
}
console.log(`Theme validation complete: ${passed}/${tests.length} checks passed.`);
