import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const origin = (process.env.HERO_QA_ORIGIN || "http://localhost:3039").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profileDirectory = await mkdtemp(join(tmpdir(), "haribol-hero-transfer-"));
const debuggingPort = 9335;
const outputPath = resolve("docs/phase-31d/transfer-report.json");
const chrome = spawn(chromePath, [
  "--headless=new",
  "--no-sandbox",
  "--disable-extensions",
  "--no-first-run",
  `--remote-debugging-port=${debuggingPort}`,
  `--user-data-dir=${profileDirectory}`,
  "about:blank",
], { stdio: "ignore", windowsHide: true });
const pause = (milliseconds) => new Promise((resolvePause) => setTimeout(resolvePause, milliseconds));

async function findPageTarget() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${debuggingPort}/json/list`).then((response) => response.json());
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch { /* Chrome is still starting. */ }
    await pause(100);
  }
  throw new Error("Chrome DevTools endpoint did not become available.");
}

const target = await findPageTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolveOpen, rejectOpen) => {
  socket.addEventListener("open", resolveOpen, { once: true });
  socket.addEventListener("error", rejectOpen, { once: true });
});

let commandId = 0;
const pending = new Map();
const responses = new Map();
const scripts = [];
const startedAt = performance.now();

socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(String(data));
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
    return;
  }
  if (message.method === "Network.responseReceived" && message.params.type === "Script") {
    responses.set(message.params.requestId, {
      url: message.params.response.url,
      mimeType: message.params.response.mimeType,
      status: message.params.response.status,
      responseAtMs: Math.round(performance.now() - startedAt),
    });
  }
  if (message.method === "Network.loadingFinished") {
    const response = responses.get(message.params.requestId);
    if (!response) return;
    scripts.push({
      ...response,
      transferBytes: message.params.encodedDataLength,
      finishedAtMs: Math.round(performance.now() - startedAt),
    });
    responses.delete(message.params.requestId);
  }
});

function command(method, params = {}) {
  const id = ++commandId;
  return new Promise((resolveCommand, rejectCommand) => {
    pending.set(id, { resolve: resolveCommand, reject: rejectCommand });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

try {
  await command("Network.enable", { maxTotalBufferSize: 10_000_000 });
  await command("Network.setCacheDisabled", { cacheDisabled: true });
  await command("Page.enable");
  await command("Page.navigate", { url: `${origin}/` });
  await pause(2_500);
  const totalScriptTransferBytes = scripts.reduce((total, script) => total + script.transferBytes, 0);
  const lateScripts = scripts.filter((script) => script.responseAtMs >= 1_000);
  const report = {
    origin,
    generatedAt: new Date().toISOString(),
    cacheDisabled: true,
    totalScriptTransferBytes,
    scriptRequestCount: scripts.length,
    lateScriptTransferBytes: lateScripts.reduce((total, script) => total + script.transferBytes, 0),
    scripts,
    lateScripts,
  };
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Measured ${report.scriptRequestCount} scripts / ${report.totalScriptTransferBytes} transferred bytes.`);
  console.log(`Late enhancement: ${lateScripts.length} script / ${report.lateScriptTransferBytes} transferred bytes.`);
} finally {
  try { await command("Browser.close"); } catch { chrome.kill(); }
  socket.close();
  await pause(200);
  await rm(profileDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
