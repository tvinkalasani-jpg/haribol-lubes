import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const stage = process.env.PHASE31K_STAGE === "after" ? "after" : "baseline";
const origin = (process.env.PHASE31K_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const output = resolve(`docs/phase-31k/${stage}`);
const profile = await mkdtemp(join(tmpdir(), `haribol-31k-${stage}-`));
const port = stage === "after" ? 9374 : 9373;
await mkdir(output, { recursive: true });
const chrome = spawn(chromePath, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-extensions", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore", windowsHide: true });
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
const responses = new Map();
const errors = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(String(data));
  if (message.id) {
    const item = pending.get(message.id);
    if (!item) return;
    pending.delete(message.id);
    if (message.error) item.reject(new Error(message.error.message)); else item.resolve(message.result);
  } else if (message.method === "Network.responseReceived") {
    const response = message.params.response;
    responses.set(message.params.requestId, { url: response.url, type: message.params.type, mimeType: response.mimeType, status: response.status, encodedBytes: 0 });
  } else if (message.method === "Network.loadingFinished") {
    const response = responses.get(message.params.requestId);
    if (response) response.encodedBytes = message.params.encodedDataLength;
  } else if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
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
const targets = [
  { id: "homepage-light", path: "/", theme: "light" },
  { id: "homepage-dark", path: "/", theme: "dark" },
  { id: "product-detail-light", path: "/products/engine-oils/mastermax-engine-oils", theme: "light" },
  { id: "industries-light", path: "/industries", theme: "light" },
  { id: "contact-light", path: "/contact", theme: "light" },
  { id: "rfq-light", path: "/request-a-quote", theme: "light" },
  { id: "finder-light", path: "/product-finder", theme: "light" },
];
const result = [];

try {
  await command("Page.enable");
  await command("Runtime.enable");
  await command("Network.enable");
  await command("Network.setCacheDisabled", { cacheDisabled: true });
  await command("Performance.enable");
  await command("Page.addScriptToEvaluateOnNewDocument", { source: `window.__haribolLongTasks=[];new PerformanceObserver((list)=>{for(const entry of list.getEntries())window.__haribolLongTasks.push({startTime:entry.startTime,duration:entry.duration})}).observe({type:"longtask",buffered:true});` });
  for (const entry of targets) {
    responses.clear();
    await command("Network.clearBrowserCache");
    await command("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
    await command("Page.navigate", { url: `${origin}${entry.path}` });
    for (let attempt = 0; attempt < 120; attempt += 1) {
      if (await evaluate(`document.readyState === "complete" && location.pathname === ${JSON.stringify(entry.path)}`)) break;
      await pause(100);
    }
    await evaluate(`localStorage.setItem("haribol-theme", ${JSON.stringify(entry.theme)});document.documentElement.dataset.theme=${JSON.stringify(entry.theme)};document.documentElement.dataset.themePreference=${JSON.stringify(entry.theme)}`);
    await pause(1200);
    const documentMetrics = await evaluate(`({domNodes:document.querySelectorAll("*").length,htmlBytes:new Blob([document.documentElement.outerHTML]).size,longTasks:window.__haribolLongTasks||[],clientComponents:document.querySelectorAll("[data-reactroot]").length,images:[...document.images].map((image)=>({src:image.currentSrc||image.src,loading:image.loading,complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,renderWidth:Math.round(image.getBoundingClientRect().width),renderHeight:Math.round(image.getBoundingClientRect().height)}))})`);
    const performance = await command("Performance.getMetrics");
    const metrics = Object.fromEntries(performance.metrics.map((metric) => [metric.name, metric.value]));
    const resources = [...responses.values()].filter(({ url }) => url.startsWith(origin));
    const bytes = (type) => resources.filter((resource) => resource.type === type).reduce((sum, resource) => sum + resource.encodedBytes, 0);
    result.push({
      ...entry,
      ...documentMetrics,
      network: { requests: resources.length, documentBytes: bytes("Document"), jsRequests: resources.filter(({ type }) => type === "Script").length, jsBytes: bytes("Script"), cssRequests: resources.filter(({ type }) => type === "Stylesheet").length, cssBytes: bytes("Stylesheet"), imageRequests: resources.filter(({ type }) => type === "Image").length, imageBytes: bytes("Image"), fontRequests: resources.filter(({ type }) => type === "Font").length, fontBytes: bytes("Font"), totalBytes: resources.reduce((sum, resource) => sum + resource.encodedBytes, 0) },
      runtime: { nodes: metrics.Nodes, jsHeapUsedBytes: metrics.JSHeapUsedSize, layoutCount: metrics.LayoutCount, recalcStyleCount: metrics.RecalcStyleCount, layoutDurationMs: metrics.LayoutDuration * 1000, recalcStyleDurationMs: metrics.RecalcStyleDuration * 1000, scriptDurationMs: metrics.ScriptDuration * 1000, taskDurationMs: metrics.TaskDuration * 1000 },
    });
  }
  await writeFile(resolve(output, "route-profile.json"), `${JSON.stringify({ stage, generatedAt: new Date().toISOString(), origin, result, errors }, null, 2)}\n`);
  console.log(`Phase 31K ${stage} route profile complete: ${result.length}/${targets.length} routes, ${errors.length} browser errors.`);
  if (errors.length) process.exitCode = 1;
} finally {
  socket.close();
  chrome.kill();
  await pause(300);
  try { await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
}
