import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const origin = (process.env.MASTERMAX_QA_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profile = await mkdtemp(join(tmpdir(), "haribol-mastermax-transfer-"));
const port = 9338;
const outputPath = resolve("docs/phase-31f/transfer-report.json");
await mkdir(resolve("docs/phase-31f"), { recursive: true });
const chrome = spawn(chromePath, ["--headless=new", "--no-sandbox", "--disable-extensions", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore", windowsHide: true });
const pause = (ms) => new Promise((resolvePause) => setTimeout(resolvePause, ms));

let target;
for (let attempt = 0; attempt < 100 && !target; attempt += 1) {
  try {
    const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
    target = targets.find((entry) => entry.type === "page");
  } catch { /* Chrome is starting. */ }
  if (!target) await pause(100);
}
if (!target?.webSocketDebuggerUrl) throw new Error("Chrome DevTools endpoint did not become available.");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolveOpen, rejectOpen) => { socket.addEventListener("open", resolveOpen, { once: true }); socket.addEventListener("error", rejectOpen, { once: true }); });
let id = 0;
const pending = new Map();
const responses = new Map();
const resources = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(String(data));
  if (message.id) {
    const request = pending.get(message.id); if (!request) return; pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result); return;
  }
  if (message.method === "Network.responseReceived") responses.set(message.params.requestId, { url: message.params.response.url, type: message.params.type, status: message.params.response.status });
  if (message.method === "Network.loadingFinished") {
    const response = responses.get(message.params.requestId); if (!response) return;
    resources.push({ ...response, transferBytes: message.params.encodedDataLength }); responses.delete(message.params.requestId);
  }
});
const command = (method, params = {}) => new Promise((resolveCommand, rejectCommand) => { const commandId = ++id; pending.set(commandId, { resolve: resolveCommand, reject: rejectCommand }); socket.send(JSON.stringify({ id: commandId, method, params })); });

try {
  await command("Network.enable");
  await command("Network.setCacheDisabled", { cacheDisabled: true });
  await command("Page.enable");
  await command("Page.navigate", { url: `${origin}/` });
  await pause(2_500);
  const initialCount = resources.length;
  await command("Runtime.evaluate", { expression: `document.querySelector('[data-mastermax-showcase]').scrollIntoView({block:'center'})` });
  await pause(2_500);
  const initial = resources.slice(0, initialCount);
  const afterScroll = resources.slice(initialCount);
  const mastermaxImages = afterScroll.filter((resource) => resource.type === "Image" && resource.url.includes("mastermax"));
  const total = (items) => items.reduce((sum, item) => sum + item.transferBytes, 0);
  const report = {
    origin,
    generatedAt: new Date().toISOString(),
    cacheDisabled: true,
    initialDocumentTransferBytes: total(initial.filter((resource) => resource.type === "Document")),
    initialScriptTransferBytes: total(initial.filter((resource) => resource.type === "Script")),
    initialScriptRequestCount: initial.filter((resource) => resource.type === "Script").length,
    initialMastermaxImageTransferBytes: total(initial.filter((resource) => resource.type === "Image" && resource.url.includes("mastermax"))),
    mastermaxImagesAfterScrollTransferBytes: total(mastermaxImages),
    mastermaxImagesAfterScrollCount: mastermaxImages.length,
    mastermaxImages,
  };
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Initial scripts: ${report.initialScriptRequestCount} / ${report.initialScriptTransferBytes} bytes.`);
  console.log(`Initial Mastermax images: ${report.initialMastermaxImageTransferBytes} bytes.`);
  console.log(`Mastermax images after scroll: ${report.mastermaxImagesAfterScrollCount} / ${report.mastermaxImagesAfterScrollTransferBytes} bytes.`);
} finally {
  try { await command("Browser.close"); } catch { chrome.kill(); }
  socket.close(); await pause(300);
  try { await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* OS cleanup can lag. */ }
}
