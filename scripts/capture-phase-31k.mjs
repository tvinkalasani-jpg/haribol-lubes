import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const origin = (process.env.ACCESSIBILITY_QA_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const output = resolve("docs/phase-31k/responsive");
const profile = await mkdtemp(join(tmpdir(), "haribol-31k-"));
const port = 9374;
await mkdir(output, { recursive: true });
const chrome = spawn(chromePath, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-extensions", "--hide-scrollbars", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore", windowsHide: true });
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
let target;
for (let attempt = 0; attempt < 100 && !target; attempt += 1) {
  try { target = (await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json())).find((entry) => entry.type === "page"); } catch {}
  if (!target) await pause(100);
}
if (!target?.webSocketDebuggerUrl) throw new Error("Chrome unavailable");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((done, reject) => { socket.addEventListener("open", done, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let id = 0;
const pending = new Map();
const browserErrors = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(String(data));
  if (message.id) {
    const item = pending.get(message.id);
    if (!item) return;
    pending.delete(message.id);
    if (message.error) item.reject(new Error(message.error.message)); else item.resolve(message.result);
  } else if (message.method === "Runtime.exceptionThrown") browserErrors.push(message.params.exceptionDetails.text);
  else if (message.method === "Log.entryAdded" && message.params.entry.level === "error") browserErrors.push(message.params.entry.text);
});
const command = (method, params = {}) => new Promise((resolveCommand, reject) => {
  const commandId = ++id;
  pending.set(commandId, { resolve: resolveCommand, reject });
  socket.send(JSON.stringify({ id: commandId, method, params }));
});
const evaluate = async (expression) => {
  const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const pages = [
  { id: "homepage", path: "/" },
  { id: "products", path: "/products" },
  { id: "product-category", path: "/products/engine-oils" },
  { id: "product-detail", path: "/products/engine-oils/mastermax-engine-oils" },
  { id: "industries", path: "/industries" },
  { id: "industry", path: "/industries/automotive" },
  { id: "finder", path: "/product-finder" },
  { id: "about", path: "/about" },
  { id: "contact", path: "/contact" },
  { id: "resources", path: "/resources" },
  { id: "insights", path: "/insights" },
  { id: "rfq", path: "/request-a-quote" },
];
const widths = [320, 390, 480, 768, 1024, 1440, 1920];
const results = [];
const keyboardResults = [];

async function setViewport(width, height = 900) {
  await command("Emulation.setDeviceMetricsOverride", { width, height, screenWidth: width, screenHeight: height, deviceScaleFactor: 1, mobile: width <= 480 });
  await command("Emulation.setTouchEmulationEnabled", { enabled: width <= 480, maxTouchPoints: width <= 480 ? 5 : 1 });
}

async function go(path, theme, width, height = 900, reducedMotion = false) {
  await setViewport(width, height);
  await command("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" }, { name: "prefers-color-scheme", value: theme }] });
  await command("Page.navigate", { url: `${origin}${path}` });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (await evaluate(`document.readyState === "complete" && location.pathname === ${JSON.stringify(path)}`)) break;
    await pause(100);
  }
  await evaluate(`(() => { localStorage.setItem("haribol-theme", ${JSON.stringify(theme)}); const root = document.documentElement; root.dataset.theme = ${JSON.stringify(theme)}; root.dataset.themePreference = ${JSON.stringify(theme)}; root.style.colorScheme = ${JSON.stringify(theme)}; })()`);
  await pause(150);
}

const auditExpression = `(() => {
  const visible = (element) => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0; };
  const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
  const duplicates = [...new Set(ids.filter((value, index) => ids.indexOf(value) !== index))];
  const missingImageAlt = [...document.querySelectorAll("img")].filter((image) => !image.hasAttribute("alt")).length;
  const unnamedButtons = [...document.querySelectorAll("button")].filter((button) => visible(button) && !(button.textContent || button.getAttribute("aria-label") || button.getAttribute("aria-labelledby"))?.trim()).length;
  const unnamedLinks = [...document.querySelectorAll("a[href]")].filter((link) => visible(link) && !(link.textContent || link.getAttribute("aria-label") || link.getAttribute("aria-labelledby"))?.trim()).length;
  const controls = [...document.querySelectorAll("input:not([type=hidden]), select, textarea")].filter(visible);
  const unlabeledControls = controls.filter((control) => { const id = control.id; return !(control.getAttribute("aria-label") || control.getAttribute("aria-labelledby") || control.closest("label") || (id && document.querySelector('label[for="' + CSS.escape(id) + '"]'))); }).length;
  const headings = [...document.querySelectorAll("main h1, main h2, main h3, main h4, main h5, main h6")].filter(visible).map((heading) => Number(heading.tagName.slice(1)));
  const headingJumps = headings.filter((level, index) => index > 0 && level > headings[index - 1] + 1).length;
  const smallControls = [...document.querySelectorAll("button, input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([tabindex='-1']), select, textarea")].filter(visible).map((element) => { const rect = element.getBoundingClientRect(); return { name: (element.getAttribute("aria-label") || element.textContent || element.getAttribute("name") || element.tagName).trim().slice(0, 60), width: Math.round(rect.width), height: Math.round(rect.height) }; }).filter((item) => item.width < 44 || item.height < 44);
  const text = document.querySelector("main")?.innerText || "";
  return {
    theme: document.documentElement.dataset.theme,
    mains: document.querySelectorAll("main").length,
    h1s: [...document.querySelectorAll("main h1")].filter(visible).length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    duplicates,
    missingImageAlt,
    unnamedButtons,
    unnamedLinks,
    unlabeledControls,
    headingJumps,
    smallControls,
    commerce: /(Add to Cart|Buy Now|KSh [0-9]|In Stock|M-Pesa|card payment)/i.test(text),
  };
})()`;

async function screenshot(name, width, height) {
  const metrics = await evaluate(`({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight })`);
  const captureLimit = width <= 480 ? Math.max(height, 2200) : Math.max(height, 2800);
  const image = await command("Page.captureScreenshot", { format: "jpeg", quality: 86, fromSurface: true, captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: Math.min(metrics.height, captureLimit), scale: 1 } });
  await writeFile(join(output, name), Buffer.from(image.data, "base64"));
}

try {
  await command("Page.enable");
  await command("Runtime.enable");
  await command("Log.enable");
  for (const theme of ["light", "dark"]) {
    for (const page of pages) {
      await go(page.path, theme, widths[0]);
      for (const width of widths) {
        await setViewport(width, 900);
        await pause(80);
        const audit = await evaluate(auditExpression);
        const passed = audit.theme === theme && audit.mains === 1 && audit.h1s === 1 && !audit.overflow && !audit.duplicates.length && !audit.missingImageAlt && !audit.unnamedButtons && !audit.unnamedLinks && !audit.unlabeledControls && !audit.headingJumps && !audit.smallControls.length && !audit.commerce;
        results.push({ theme, page: page.id, width, height: 900, ...audit, passed });
      }
      await setViewport(844, 390);
      await pause(80);
      const landscapeAudit = await evaluate(auditExpression);
      const landscapePassed = landscapeAudit.theme === theme && landscapeAudit.mains === 1 && landscapeAudit.h1s === 1 && !landscapeAudit.overflow && !landscapeAudit.duplicates.length && !landscapeAudit.missingImageAlt && !landscapeAudit.unnamedButtons && !landscapeAudit.unnamedLinks && !landscapeAudit.unlabeledControls && !landscapeAudit.headingJumps && !landscapeAudit.smallControls.length && !landscapeAudit.commerce;
      results.push({ theme, page: page.id, width: 844, height: 390, landscape: true, ...landscapeAudit, passed: landscapePassed });
    }
  }

  await go("/", "light", 390, 844);
  const mobileMenu = await evaluate(`(() => { const trigger = document.querySelector("[data-mobile-trigger]"); trigger.click(); const panel = document.querySelector("[data-mobile-panel]"); const open = trigger.getAttribute("aria-expanded") === "true" && panel.getAttribute("aria-hidden") === "false" && !panel.hasAttribute("inert") && panel.contains(document.activeElement); const product = document.querySelector("[data-mobile-products-trigger]"); product.click(); const productPanel = document.querySelector("[data-mobile-products-panel]"); return { open, productsOpen: product.getAttribute("aria-expanded") === "true" && !productPanel.hasAttribute("inert") }; })()`);
  await command("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
  await command("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
  await pause(50);
  mobileMenu.escapeClosed = await evaluate(`document.querySelector("[data-mobile-trigger]").getAttribute("aria-expanded") === "false" && document.activeElement === document.querySelector("[data-mobile-trigger]")`);

  for (const path of ["/", "/products", "/products/engine-oils/mastermax-engine-oils", "/industries", "/product-finder", "/contact", "/request-a-quote", "/resources"]) {
    await go(path, "light", 1440, 900);
    const stops = [];
    for (let index = 0; index < 12; index += 1) {
      await command("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab" });
      await command("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab" });
      await pause(150);
      stops.push(await evaluate(`(() => { const element = document.activeElement; const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return { tag: element.tagName, name: (element.getAttribute("aria-label") || element.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 70), visible: rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.top <= innerHeight, focusIndicator: parseFloat(style.outlineWidth) >= 2 || style.boxShadow !== "none" }; })()`));
    }
    keyboardResults.push({ path, stops, passed: stops.every((stop) => stop.tag !== "BODY" && stop.visible && stop.focusIndicator) });
  }

  await go("/", "light", 390, 844, true);
  const reducedMotion = await evaluate(`(() => { const animated = [...document.querySelectorAll("*")].filter((element) => { const style = getComputedStyle(element); return style.animationName !== "none" && style.animationPlayState !== "paused" && parseFloat(style.animationDuration) > 0.02; }); const transitioning = [...document.querySelectorAll("*")].filter((element) => Math.max(...getComputedStyle(element).transitionDuration.split(",").map((value) => parseFloat(value))) > 0.02); return { animated: animated.length, transitioning: transitioning.length }; })()`);

  const captures = [
    { name: "homepage-light-mobile.jpg", path: "/", theme: "light", width: 390, height: 844 },
    { name: "homepage-dark-mobile.jpg", path: "/", theme: "dark", width: 390, height: 844 },
    { name: "product-detail-light-mobile.jpg", path: "/products/engine-oils/mastermax-engine-oils", theme: "light", width: 390, height: 844 },
    { name: "industries-dark-mobile.jpg", path: "/industries", theme: "dark", width: 390, height: 844 },
    { name: "contact-light-mobile.jpg", path: "/contact", theme: "light", width: 390, height: 844 },
    { name: "rfq-dark-mobile.jpg", path: "/request-a-quote", theme: "dark", width: 390, height: 844 },
    { name: "homepage-light-landscape.jpg", path: "/", theme: "light", width: 844, height: 390 },
    { name: "homepage-light-desktop.jpg", path: "/", theme: "light", width: 1440, height: 1000 },
  ];
  for (const capture of captures) { await go(capture.path, capture.theme, capture.width, capture.height); await screenshot(capture.name, capture.width, capture.height); }

  const failed = results.filter((result) => !result.passed);
  const keyboardFailed = keyboardResults.filter((result) => !result.passed);
  const report = { origin, generatedAt: new Date().toISOString(), results, failed: failed.length, mobileMenu, reducedMotion, keyboardResults, keyboardFailed: keyboardFailed.length, browserErrors };
  await writeFile(join(output, "browser-accessibility-validation.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Responsive accessibility validation: ${results.length - failed.length}/${results.length} states passed.`);
  console.log(`Keyboard flows: ${keyboardResults.length - keyboardFailed.length}/${keyboardResults.length} passed.`);
  console.log(`Mobile menu: ${mobileMenu.open && mobileMenu.productsOpen && mobileMenu.escapeClosed ? "passed" : "failed"}.`);
  console.log(`Reduced motion: ${reducedMotion.animated === 0 && reducedMotion.transitioning === 0 ? "passed" : "failed"}.`);
  console.log(`Browser errors: ${browserErrors.length}.`);
  if (failed.length || keyboardFailed.length || !mobileMenu.open || !mobileMenu.productsOpen || !mobileMenu.escapeClosed || reducedMotion.animated || reducedMotion.transitioning || browserErrors.length) process.exitCode = 1;
} finally {
  socket.close();
  chrome.kill();
  await pause(300);
  try { await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
}
