import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const origin = (process.env.HOMEPAGE_QA_ORIGIN || "http://localhost:3036").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDirectory = resolve("docs/phase-31c");
const profileDirectory = await mkdtemp(join(tmpdir(), "haribol-phase-31c-"));
const debuggingPort = 9333;
await mkdir(outputDirectory, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--disable-gpu-sandbox",
  "--disable-software-rasterizer",
  "--disable-extensions",
  "--hide-scrollbars",
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
const eventWaiters = new Map();
const browserErrors = [];

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
  if (message.method === "Runtime.exceptionThrown") browserErrors.push(message.params.exceptionDetails.text);
  const waiters = eventWaiters.get(message.method) || [];
  eventWaiters.delete(message.method);
  waiters.forEach((resolveEvent) => resolveEvent(message.params));
});

function command(method, params = {}) {
  const id = ++commandId;
  return new Promise((resolveCommand, rejectCommand) => {
    pending.set(id, { resolve: resolveCommand, reject: rejectCommand });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

function waitForEvent(method, timeout = 20_000) {
  return new Promise((resolveEvent, rejectEvent) => {
    const timer = setTimeout(() => rejectEvent(new Error(`Timed out waiting for ${method}.`)), timeout);
    const resolveWithCleanup = (params) => { clearTimeout(timer); resolveEvent(params); };
    eventWaiters.set(method, [...(eventWaiters.get(method) || []), resolveWithCleanup]);
  });
}

async function navigate(path) {
  const loaded = waitForEvent("Page.loadEventFired");
  await command("Page.navigate", { url: `${origin}${path}` });
  await loaded;
  await pause(120);
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function setViewport(width, height) {
  await command("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await pause(40);
}

async function setTheme(theme) {
  await navigate("/");
  const loaded = waitForEvent("Page.loadEventFired");
  await evaluate(`localStorage.setItem("haribol-theme", ${JSON.stringify(theme)}); location.reload();`);
  await loaded;
  await pause(120);
}

async function screenshot(name) {
  const result = await command("Page.captureScreenshot", { format: "jpeg", quality: 88, fromSurface: true, captureBeyondViewport: false });
  await writeFile(join(outputDirectory, name), Buffer.from(result.data, "base64"));
}

async function screenshotSection(selector, name, maximumHeight = 1100) {
  const rect = await evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    const bounds = element.getBoundingClientRect();
    return { x: 0, y: bounds.top + scrollY, width: document.documentElement.clientWidth, height: Math.min(bounds.height, ${maximumHeight}) };
  })()`);
  if (!rect) throw new Error(`Screenshot section not found: ${selector}`);
  const result = await command("Page.captureScreenshot", { format: "jpeg", quality: 88, fromSurface: true, captureBeyondViewport: true, clip: { ...rect, scale: 1 } });
  await writeFile(join(outputDirectory, name), Buffer.from(result.data, "base64"));
}

const widths = [320, 390, 480, 768, 900, 1024, 1120, 1280, 1440, 1920];
const results = [];

try {
  await command("Page.enable");
  await command("Runtime.enable");

  for (const theme of ["light", "dark"]) {
    await setTheme(theme);
    {
      const path = "/";
      await navigate(path);
      for (const width of widths) {
        await setViewport(width, 900);
        const metrics = await evaluate(`(() => {
          const main = document.querySelector("main");
          const sections = [...main.querySelectorAll(":scope > section, :scope > div > section")];
          const actionable = [...main.querySelectorAll("a, button")].filter((element) => {
            const style = getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden" && element.getBoundingClientRect().width > 0;
          });
          const clippedActions = actionable.filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > innerWidth + 1;
          }).length;
          const sectionRects = sections.map((section) => section.getBoundingClientRect());
          return {
            theme: document.documentElement.dataset.theme,
            horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            clippedActions,
            h1Count: main.querySelectorAll("h1").length,
            sectionCount: sections.length,
            overlappingSections: sectionRects.some((rect, index) => index > 0 && rect.top < sectionRects[index - 1].bottom - 1),
            locationCorrect: main.textContent.includes("Mlolongo") && !main.textContent.includes("Nairobi"),
            commerceHidden: !/add to cart|buy now|checkout/i.test(main.textContent),
            visualSlots: main.querySelectorAll("[data-visual-slot]").length,
          };
        })()`);
        const passed = metrics.theme === theme
          && !metrics.horizontalOverflow
          && metrics.clippedActions === 0
          && metrics.h1Count === 1
          && metrics.sectionCount === 10
          && !metrics.overlappingSections
          && metrics.locationCorrect
          && metrics.commerceHidden
          && metrics.visualSlots >= 9;
        results.push({ theme, path, width, passed, ...metrics });
      }
    }
  }

  await setViewport(1440, 900);
  await setTheme("light");
  await screenshot("homepage-light-desktop.jpg");
  await setTheme("dark");
  await screenshot("homepage-dark-desktop.jpg");

  await setViewport(390, 844);
  await setTheme("light");
  await screenshot("homepage-light-mobile.jpg");
  await setTheme("dark");
  await screenshot("homepage-dark-mobile.jpg");

  await setViewport(1600, 1000);
  await setTheme("light");
  await screenshot("hero-light-desktop.jpg");
  await screenshotSection('[aria-labelledby="product-range-title"]', "product-categories.jpg");
  await screenshotSection('[aria-labelledby="mastermax-showcase-title"]', "mastermax-showcase.jpg");
  await screenshotSection('[aria-labelledby="quote-cta-title"]', "final-rfq-cta.jpg");

  const failed = results.filter((result) => !result.passed);
  const report = { origin, generatedAt: new Date().toISOString(), checks: results.length, passed: results.length - failed.length, failed, browserErrors };
  await writeFile(join(outputDirectory, "responsive-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Homepage browser QA complete: ${report.passed}/${report.checks} responsive checks passed.`);
  console.log(`Browser exceptions: ${browserErrors.length}.`);
  if (failed.length || browserErrors.length) process.exitCode = 1;
} finally {
  try { await command("Browser.close"); } catch { chrome.kill(); }
  socket.close();
  await pause(200);
  try { await rm(profileDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
  catch (error) { console.warn(`Temporary Chrome profile cleanup deferred: ${error.code || "unknown error"}.`); }
}
