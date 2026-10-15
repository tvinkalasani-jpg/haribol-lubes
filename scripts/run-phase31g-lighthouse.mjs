import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const origin = (process.env.LIGHTHOUSE_ORIGIN || "http://localhost:3000").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const lighthouseCli = process.env.LIGHTHOUSE_CLI || "C:\\Users\\User\\AppData\\Local\\Temp\\haribol-lighthouse\\node_modules\\lighthouse\\cli\\index.js";
const outputDirectory = resolve("docs/phase-31g/lighthouse");
await mkdir(outputDirectory, { recursive: true });
const pause = (ms) => new Promise((resolvePause) => setTimeout(resolvePause, ms));

function runProcess(executable, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(executable, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let errorOutput = "";
    child.stderr.on("data", (chunk) => { errorOutput += chunk; });
    child.on("error", rejectRun);
    child.on("exit", (code) => code === 0 ? resolveRun() : rejectRun(new Error(errorOutput || `${executable} exited ${code}`)));
  });
}

async function connect(port) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return new WebSocket(page.webSocketDebuggerUrl);
    } catch { /* Chrome is starting. */ }
    await pause(100);
  }
  throw new Error("Chrome DevTools endpoint did not become available.");
}

async function seedTheme(port, theme) {
  const socket = await connect(port);
  await new Promise((resolveOpen, rejectOpen) => {
    if (socket.readyState === WebSocket.OPEN) resolveOpen();
    else {
      socket.addEventListener("open", resolveOpen, { once: true });
      socket.addEventListener("error", rejectOpen, { once: true });
    }
  });
  let id = 0;
  const pending = new Map();
  const events = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(String(data));
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    } else {
      const listeners = events.get(message.method) || [];
      events.delete(message.method);
      listeners.forEach((listener) => listener(message.params));
    }
  });
  const command = (method, params = {}) => new Promise((resolveCommand, rejectCommand) => {
    const commandId = ++id;
    pending.set(commandId, { resolve: resolveCommand, reject: rejectCommand });
    socket.send(JSON.stringify({ id: commandId, method, params }));
  });
  const waitFor = (method) => new Promise((resolveEvent) => events.set(method, [...(events.get(method) || []), resolveEvent]));
  await command("Page.enable");
  const loaded = waitFor("Page.loadEventFired");
  await command("Page.navigate", { url: `${origin}/` });
  await loaded;
  await command("Runtime.evaluate", { expression: `localStorage.setItem("haribol-theme", ${JSON.stringify(theme)})` });
  socket.close();
}

const score = (report, category) => Math.round((report.categories[category]?.score ?? 0) * 100);
const metric = (report, audit) => Math.round(report.audits[audit]?.numericValue ?? 0);

async function audit(theme, run, port) {
  const profile = await mkdtemp(join(tmpdir(), `haribol-31g-lh-${theme}-${run}-`));
  const chrome = spawn(chromePath, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-extensions", "--no-first-run", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore", windowsHide: true });
  const outputPath = join(outputDirectory, `${theme}-${run}.json`);
  try {
    await seedTheme(port, theme);
    await runProcess(process.execPath, [lighthouseCli, `${origin}/`, `--port=${port}`, "--output=json", `--output-path=${outputPath}`, "--only-categories=performance,accessibility,best-practices", "--form-factor=mobile", "--throttling-method=simulate", "--disable-storage-reset", "--quiet"]);
    const report = JSON.parse(await readFile(outputPath, "utf8"));
    const result = {
      theme, run,
      performance: score(report, "performance"),
      accessibility: score(report, "accessibility"),
      bestPractices: score(report, "best-practices"),
      fcpMs: metric(report, "first-contentful-paint"),
      lcpMs: metric(report, "largest-contentful-paint"),
      tbtMs: metric(report, "total-blocking-time"),
      cls: report.audits["cumulative-layout-shift"]?.numericValue ?? 0,
      speedIndexMs: metric(report, "speed-index"),
      mainThreadMs: metric(report, "mainthread-work-breakdown"),
      bootupMs: metric(report, "bootup-time"),
      benchmarkIndex: Math.round(report.environment?.benchmarkIndex ?? 0),
    };
    console.log(`${theme} run ${run}: P${result.performance} A${result.accessibility} BP${result.bestPractices} LCP ${result.lcpMs}ms CLS ${result.cls} benchmark ${result.benchmarkIndex}`);
    return result;
  } finally {
    chrome.kill();
    await pause(400);
    try { await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
    catch (error) { console.warn(`Temporary Lighthouse profile cleanup deferred: ${error.code || "unknown error"}.`); }
  }
}

const runs = [];
for (const theme of ["light", "dark"]) for (let run = 1; run <= 3; run += 1) runs.push(await audit(theme, run, 9460 + runs.length));
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const fields = ["performance", "accessibility", "bestPractices", "fcpMs", "lcpMs", "tbtMs", "cls", "speedIndexMs", "mainThreadMs", "bootupMs", "benchmarkIndex"];
const medians = Object.fromEntries(["light", "dark"].map((theme) => {
  const themed = runs.filter((entry) => entry.theme === theme);
  return [theme, Object.fromEntries(fields.map((field) => [field, median(themed.map((entry) => entry[field]))]))];
}));
await writeFile(join(outputDirectory, "summary.json"), `${JSON.stringify({ origin, generatedAt: new Date().toISOString(), profile: "Lighthouse mobile / simulated throttling", runs, medians }, null, 2)}\n`);
console.log(`Medians: light P${medians.light.performance}, dark P${medians.dark.performance}.`);
