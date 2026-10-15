import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const origin = (process.env.CATEGORY_QA_ORIGIN || "http://localhost:3042").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDirectory = resolve("docs/phase-31e");
const profileDirectory = await mkdtemp(join(tmpdir(), "haribol-phase-31e-"));
const debuggingPort = 9336;
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

function waitForEvent(method, timeout = 60_000) {
  return new Promise((resolveEvent, rejectEvent) => {
    const timer = setTimeout(() => rejectEvent(new Error(`Timed out waiting for ${method}.`)), timeout);
    const resolveWithCleanup = (params) => { clearTimeout(timer); resolveEvent(params); };
    eventWaiters.set(method, [...(eventWaiters.get(method) || []), resolveWithCleanup]);
  });
}

async function navigate() {
  const loaded = waitForEvent("Page.loadEventFired");
  await command("Page.navigate", { url: `${origin}/` });
  await loaded;
  await pause(150);
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function setViewport(width, height) {
  await command("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await pause(50);
}

async function setTheme(theme) {
  await navigate();
  const loaded = waitForEvent("Page.loadEventFired");
  await evaluate(`localStorage.setItem("haribol-theme", ${JSON.stringify(theme)}); location.reload();`);
  await loaded;
  await pause(150);
}

async function forcePseudo(selector, forcedPseudoClasses) {
  const { root } = await command("DOM.getDocument", { depth: 0 });
  const { nodeId } = await command("DOM.querySelector", { nodeId: root.nodeId, selector });
  if (!nodeId) throw new Error(`Unable to resolve ${selector} for pseudo-state capture.`);
  await command("CSS.forcePseudoState", { nodeId, forcedPseudoClasses });
  return nodeId;
}

async function screenshotClip(name, clip) {
  const result = await command("Page.captureScreenshot", {
    format: "jpeg",
    quality: 88,
    fromSurface: true,
    captureBeyondViewport: true,
    clip,
  });
  await writeFile(join(outputDirectory, name), Buffer.from(result.data, "base64"));
}

async function captureSection(name, maxHeight = 3_000) {
  const clip = await evaluate(`(() => {
    const section = document.querySelector('[aria-labelledby="product-range-title"]');
    const rect = section.getBoundingClientRect();
    return { x: 0, y: scrollY + rect.top, width: innerWidth, height: Math.min(rect.height, ${maxHeight}), scale: 1 };
  })()`);
  await screenshotClip(name, clip);
}

const widths = [320, 390, 480, 768, 900, 1024, 1120, 1280, 1440, 1920];
const expectedRoutes = [
  "/products/engine-oils",
  "/products/transmission-gear-oils",
  "/products/transmission-gear-oils",
  "/products/hydraulic-oils",
  "/products/industrial-lubricants",
  "/products/greases",
  "/products/specialty-fluids",
];
const results = [];

try {
  await command("Page.enable");
  await command("Runtime.enable");
  await command("DOM.enable");
  await command("CSS.enable");

  for (const theme of ["light", "dark"]) {
    await setTheme(theme);
    for (const width of widths) {
      await setViewport(width, 900);
      const metrics = await evaluate(`(() => {
        const section = document.querySelector('[aria-labelledby="product-range-title"]');
        const panels = [...section.querySelectorAll('[data-category]')];
        const links = panels.map((panel) => panel.querySelector('a'));
        const artworks = panels.map((panel) => panel.querySelector('[data-category-artwork]'));
        const clippedLinks = links.filter((link) => {
          const rect = link.getBoundingClientRect();
          return rect.left < -1 || rect.right > innerWidth + 1 || rect.width < 44 || rect.height < 44;
        }).length;
        const weakArtworkFit = panels.filter((panel, index) => {
          const cardRect = panel.getBoundingClientRect();
          const artRect = artworks[index].getBoundingClientRect();
          const visibleWidth = Math.max(0, Math.min(cardRect.right, artRect.right) - Math.max(cardRect.left, artRect.left));
          return visibleWidth / artRect.width < 0.68;
        }).length;
        return {
          theme: document.documentElement.dataset.theme,
          categoryCount: panels.length,
          artworkCount: artworks.length,
          routes: links.map((link) => new URL(link.href).pathname),
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          clippedLinks,
          weakArtworkFit,
          headingsVisible: panels.every((panel) => panel.querySelector('h3')?.getBoundingClientRect().height > 0),
          descriptionsVisible: panels.every((panel) => panel.querySelector('p')?.getBoundingClientRect().height > 0),
          commerceHidden: !/add to cart|buy now|checkout|price/i.test(section.textContent),
        };
      })()`);
      const passed = metrics.theme === theme
        && metrics.categoryCount === 7
        && metrics.artworkCount === 7
        && JSON.stringify(metrics.routes) === JSON.stringify(expectedRoutes)
        && !metrics.horizontalOverflow
        && metrics.clippedLinks === 0
        && metrics.weakArtworkFit === 0
        && metrics.headingsVisible
        && metrics.descriptionsVisible
        && metrics.commerceHidden;
      results.push({ theme, width, passed, ...metrics });
    }
  }

  await setViewport(1440, 1000);
  await setTheme("light");
  await captureSection("categories-light-desktop.jpg");
  await setTheme("dark");
  await captureSection("categories-dark-desktop.jpg");

  await setViewport(390, 844);
  await setTheme("light");
  await captureSection("categories-light-mobile.jpg", 3_600);
  await setTheme("dark");
  await captureSection("categories-dark-mobile.jpg", 3_600);

  await setViewport(1440, 1000);
  await setTheme("light");
  const enginePoint = await evaluate(`(async () => {
    const card = document.querySelector('[data-category="engine"] a');
    card.scrollIntoView({ block: "center" });
    await new Promise(requestAnimationFrame);
    const rect = card.getBoundingClientRect();
    return { x: rect.left + rect.width * 0.62, y: rect.top + rect.height * 0.42 };
  })()`);
  await pause(100);
  await command("Input.dispatchMouseEvent", { type: "mouseMoved", x: enginePoint.x, y: enginePoint.y });
  const engineNodeId = await forcePseudo('[data-category="engine"] a', ["hover"]);
  await pause(350);
  const engineTransform = await evaluate(`getComputedStyle(document.querySelector('[data-category="engine"] a')).transform`);
  const engineShot = await command("Page.captureScreenshot", { format: "jpeg", quality: 88, fromSurface: true, captureBeyondViewport: false });
  await writeFile(join(outputDirectory, "categories-engine-hover.jpg"), Buffer.from(engineShot.data, "base64"));

  const hydraulicPoint = await evaluate(`(async () => {
    const card = document.querySelector('[data-category="hydraulic"] a');
    card.scrollIntoView({ block: "center" });
    await new Promise(requestAnimationFrame);
    const rect = card.getBoundingClientRect();
    return { x: rect.left + rect.width * 0.65, y: rect.top + rect.height * 0.45 };
  })()`);
  await pause(100);
  await command("CSS.forcePseudoState", { nodeId: engineNodeId, forcedPseudoClasses: [] });
  await command("Input.dispatchMouseEvent", { type: "mouseMoved", x: hydraulicPoint.x, y: hydraulicPoint.y });
  await forcePseudo('[data-category="hydraulic"] a', ["hover"]);
  await pause(350);
  const hydraulicTransform = await evaluate(`getComputedStyle(document.querySelector('[data-category="hydraulic"] a')).transform`);
  const hydraulicShot = await command("Page.captureScreenshot", { format: "jpeg", quality: 88, fromSurface: true, captureBeyondViewport: false });
  await writeFile(join(outputDirectory, "categories-hydraulic-hover.jpg"), Buffer.from(hydraulicShot.data, "base64"));

  await command("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await setTheme("light");
  const reducedMotion = await evaluate(`(() => {
    const card = document.querySelector('[data-category="engine"] a');
    const artwork = card.querySelector('[data-category-artwork]');
    return { card: getComputedStyle(card).transitionDuration, artwork: getComputedStyle(artwork).transitionDuration };
  })()`);
  await captureSection("categories-reduced-motion.jpg", 1_100);

  const failed = results.filter((result) => !result.passed);
  const report = {
    origin,
    generatedAt: new Date().toISOString(),
    checks: results.length,
    passed: results.length - failed.length,
    failed,
    engineTransform,
    hydraulicTransform,
    reducedMotion,
    browserErrors,
  };
  await writeFile(join(outputDirectory, "responsive-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Category browser QA complete: ${report.passed}/${report.checks} responsive checks passed.`);
  console.log(`Browser exceptions: ${browserErrors.length}.`);
  if (
    failed.length
    || browserErrors.length
    || Number.parseFloat(reducedMotion.card) > 0.001
    || Number.parseFloat(reducedMotion.artwork) > 0.001
    || engineTransform === "none"
    || hydraulicTransform === "none"
  ) process.exitCode = 1;
} finally {
  try { await command("Browser.close"); } catch { chrome.kill(); }
  socket.close();
  await pause(200);
  try { await rm(profileDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
  catch (error) { console.warn(`Temporary Chrome profile cleanup deferred: ${error.code || "unknown error"}.`); }
}
