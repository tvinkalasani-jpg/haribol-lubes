import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const origin = (process.env.PRODUCT_DETAIL_QA_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDirectory = resolve("docs/phase-31h");
const profileDirectory = await mkdtemp(join(tmpdir(), "haribol-phase-31h-"));
const debuggingPort = 9362;
await mkdir(outputDirectory, { recursive: true });
const chrome = spawn(chromePath, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-extensions", "--hide-scrollbars", "--no-first-run", `--remote-debugging-port=${debuggingPort}`, `--user-data-dir=${profileDirectory}`, "about:blank"], { stdio: "ignore", windowsHide: true });
const pause = (ms) => new Promise((resolvePause) => setTimeout(resolvePause, ms));

let target;
for (let attempt = 0; attempt < 100 && !target; attempt += 1) {
  try { target = (await fetch(`http://127.0.0.1:${debuggingPort}/json/list`).then((response) => response.json())).find((entry) => entry.type === "page"); } catch { /* Chrome is starting. */ }
  if (!target) await pause(100);
}
if (!target?.webSocketDebuggerUrl) throw new Error("Chrome DevTools endpoint did not become available.");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolveOpen, rejectOpen) => { socket.addEventListener("open", resolveOpen, { once: true }); socket.addEventListener("error", rejectOpen, { once: true }); });
let id = 0;
const pending = new Map();
const browserErrors = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(String(data));
  if (message.id) { const request = pending.get(message.id); if (!request) return; pending.delete(message.id); if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result); return; }
  if (message.method === "Runtime.exceptionThrown") browserErrors.push(message.params.exceptionDetails.text);
});
const command = (method, params = {}) => new Promise((resolveCommand, rejectCommand) => { const commandId = ++id; pending.set(commandId, { resolve: resolveCommand, reject: rejectCommand }); socket.send(JSON.stringify({ id: commandId, method, params })); });
async function evaluate(expression) { const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; }
async function viewport(width, height = 920) { await command("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false }); await pause(80); }
async function navigate(path, theme) {
  const currentPath = await evaluate("location.pathname + location.hash");
  if (currentPath !== path) {
    await command("Page.navigate", { url: `${origin}${path}` });
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const ready = await evaluate(`document.readyState !== 'loading' && location.pathname === ${JSON.stringify(path.split("#")[0])} && Boolean(document.querySelector('[data-product-detail]'))`);
      if (ready) break;
      await pause(250);
    }
  }
  await evaluate(`(() => { localStorage.setItem('haribol-theme', ${JSON.stringify(theme)}); document.documentElement.dataset.theme=${JSON.stringify(theme)}; document.documentElement.dataset.themePreference=${JSON.stringify(theme)}; document.documentElement.style.colorScheme=${JSON.stringify(theme)}; })()`);
  await pause(300);
  await evaluate(`(() => { localStorage.setItem('haribol-theme', ${JSON.stringify(theme)}); document.documentElement.dataset.theme=${JSON.stringify(theme)}; document.documentElement.dataset.themePreference=${JSON.stringify(theme)}; document.documentElement.style.colorScheme=${JSON.stringify(theme)}; })()`);
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await evaluate("[...document.images].every((image) => image.complete && image.naturalWidth > 0)")) break;
    await pause(125);
  }
  await pause(120);
}
async function screenshot(name, selector, maxHeight = 3_500) {
  await evaluate(`(() => { document.activeElement?.blur?.(); const header=document.querySelector('.site-shell > header'); const skip=document.querySelector('.skip-link'); if(header) header.style.visibility='hidden'; if(skip) skip.style.visibility='hidden'; })()`);
  const clip = await evaluate(`(() => { const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return {x:0,y:scrollY+r.top,width:innerWidth,height:Math.min(r.height,${maxHeight}),scale:1}; })()`);
  const image = await command("Page.captureScreenshot", { format: "jpeg", quality: 88, fromSurface: true, captureBeyondViewport: true, clip });
  await writeFile(join(outputDirectory, name), Buffer.from(image.data, "base64"));
  await evaluate(`(() => { const header=document.querySelector('.site-shell > header'); const skip=document.querySelector('.skip-link'); if(header) header.style.removeProperty('visibility'); if(skip) skip.style.removeProperty('visibility'); })()`);
}

const widths = [320, 390, 480, 768, 900, 1024, 1120, 1280, 1440, 1920];
const pages = [
  { kind: "multi", path: "/products/engine-oils/mastermax-engine-oils", variants: 6 },
  { kind: "limited", path: "/products/greases/mastermax-mp3-chassis-grease", variants: 0 },
];
const results = [];
try {
  await command("Page.enable"); await command("Runtime.enable"); await command("DOM.enable");
  for (const theme of ["light", "dark"]) {
    for (const page of pages) {
      await viewport(widths[0]); await navigate(page.path, theme);
      for (const width of widths) {
        await viewport(width);
        await evaluate(`(() => { localStorage.setItem('haribol-theme', ${JSON.stringify(theme)}); document.documentElement.dataset.theme=${JSON.stringify(theme)}; document.documentElement.dataset.themePreference=${JSON.stringify(theme)}; document.documentElement.style.colorScheme=${JSON.stringify(theme)}; })()`);
        const metrics = await evaluate(`(() => {
          const root=document.querySelector('[data-product-detail]'); const text=root?.innerText||'';
          const h1=root?.querySelector('h1')?.getBoundingClientRect(); const visual=root?.querySelector('figure')?.getBoundingClientRect();
          const quote=[...root.querySelectorAll('a')].find(a=>a.textContent.includes('Request a Quote')); const qr=quote?.getBoundingClientRect();
          const overflowNodes=[...document.querySelectorAll('body *')].flatMap(el=>{const r=el.getBoundingClientRect();return r.right>document.documentElement.clientWidth+1||r.left<-1?[el.tagName+'.'+String(el.className).slice(0,80)+':'+Math.round(r.left)+'..'+Math.round(r.right)]:[]}).slice(0,8);
          const scrollNodes=[...document.querySelectorAll('body *')].flatMap(el=>el.scrollWidth>el.clientWidth+1?[el.tagName+'.'+String(el.className).slice(0,80)+':'+el.clientWidth+'..'+el.scrollWidth]:[]).slice(0,12);
          return {theme:document.documentElement.dataset.theme,h1:root?.querySelector('h1')?.textContent,h1Visible:Boolean(h1&&h1.height>40),visualVisible:Boolean(visual&&visual.width>250&&visual.height>300),variantCount:root?.querySelectorAll('[id^="variant-"]').length||0,technicalTable:Boolean(root?.querySelector('table')),rfqHref:quote?.getAttribute('href'),rfqTarget:Boolean(qr&&qr.height>=44),whatsapp:Boolean(root?.querySelector('a[href^="https://wa.me/"]')),breadcrumbs:Boolean(root?.querySelector('nav[aria-label="Breadcrumb"]')),productFinder:Boolean(root?.querySelector('a[href="/product-finder"]')),resourcesHeading:text.includes('Packs and technical documents'),commerceHidden:!/(Add to Cart|Buy Now|KSh [0-9]|In Stock|M-Pesa|card payment)/i.test(text),scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,overflowNodes,scrollNodes,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1};
        })()`);
        const passed = metrics.theme === theme && metrics.h1Visible && metrics.visualVisible && metrics.variantCount === page.variants && metrics.technicalTable && metrics.rfqHref?.includes("/request-a-quote?product=") && metrics.rfqTarget && metrics.whatsapp && metrics.breadcrumbs && metrics.productFinder && !metrics.resourcesHeading && metrics.commerceHidden && !metrics.overflow;
        results.push({ theme, width, page: page.kind, passed, ...metrics });
      }
    }
  }

  await viewport(1440, 1000); await navigate(pages[0].path, "light"); await screenshot("product-light-desktop.jpg", "[data-product-detail] > header");
  await navigate(pages[0].path, "dark"); await screenshot("product-dark-desktop.jpg", "[data-product-detail] > header");
  await viewport(390, 844); await navigate(pages[0].path, "light"); await screenshot("product-light-mobile.jpg", "[data-product-detail] > header", 2_400);
  await navigate(pages[0].path, "dark"); await screenshot("product-dark-mobile.jpg", "[data-product-detail] > header", 2_400);
  await viewport(1440, 1000); await navigate(`${pages[0].path}#variant-mastermax-engine-15w-40-ci-4`, "light"); await screenshot("product-multi-variant.jpg", "section[aria-labelledby='product-variants-title']");
  await navigate(pages[0].path, "light"); await screenshot("product-technical-specification.jpg", "section[aria-labelledby='product-technical-title']");
  await screenshot("product-rfq-area.jpg", "section[aria-labelledby='product-enquiry-title']");
  await navigate(pages[1].path, "light"); await screenshot("product-limited-content.jpg", "[data-product-detail]", 2_800);

  const failed = results.filter((entry) => !entry.passed);
  await writeFile(join(outputDirectory, "browser-validation.json"), `${JSON.stringify({ origin, generatedAt: new Date().toISOString(), results, failed: failed.length, browserErrors }, null, 2)}\n`);
  console.log(`Product detail browser validation: ${results.length - failed.length}/${results.length} states passed.`);
  console.log(`Browser errors: ${browserErrors.length}.`);
  if (failed.length || browserErrors.length) process.exitCode = 1;
} finally {
  socket.close(); chrome.kill(); await pause(500);
  try { await rm(profileDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* OS cleanup can lag. */ }
}
