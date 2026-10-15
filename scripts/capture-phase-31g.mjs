import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const origin = (process.env.KENYA_QA_ORIGIN || "http://localhost:3045").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDirectory = resolve("docs/phase-31g");
const profileDirectory = await mkdtemp(join(tmpdir(), "haribol-phase-31g-"));
const debuggingPort = 9339;
await mkdir(outputDirectory, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-extensions", "--hide-scrollbars",
  "--no-first-run", `--remote-debugging-port=${debuggingPort}`, `--user-data-dir=${profileDirectory}`, "about:blank",
], { stdio: "ignore", windowsHide: true });

const pause = (ms) => new Promise((resolvePause) => setTimeout(resolvePause, ms));

async function findPageTarget() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${debuggingPort}/json/list`).then((response) => response.json());
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch { /* Chrome is starting. */ }
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
    const done = (params) => { clearTimeout(timer); resolveEvent(params); };
    eventWaiters.set(method, [...(eventWaiters.get(method) || []), done]);
  });
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result.value;
}

async function navigate(theme) {
  const loaded = waitForEvent("Page.loadEventFired");
  await command("Page.navigate", { url: `${origin}/` });
  await loaded;
  await evaluate(`(() => { localStorage.setItem("haribol-theme", ${JSON.stringify(theme)}); document.documentElement.dataset.theme = ${JSON.stringify(theme)}; document.documentElement.style.colorScheme = ${JSON.stringify(theme)}; })()`);
  await pause(250);
}

async function viewport(width, height = 900) {
  await command("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await pause(80);
}

async function screenshotSection(name, maxHeight = 3_400) {
  const clip = await evaluate(`(() => { const r = document.querySelector('[data-kenya-location-section]').getBoundingClientRect(); return { x: 0, y: scrollY + r.top, width: innerWidth, height: Math.min(r.height, ${maxHeight}), scale: 1 }; })()`);
  const shot = await command("Page.captureScreenshot", { format: "jpeg", quality: 88, fromSurface: true, captureBeyondViewport: true, clip });
  await writeFile(join(outputDirectory, name), Buffer.from(shot.data, "base64"));
}

const widths = [320, 390, 480, 768, 900, 1024, 1120, 1280, 1440, 1920];
const results = [];

try {
  await command("Page.enable");
  await command("Runtime.enable");
  await command("DOM.enable");
  await command("CSS.enable");

  for (const theme of ["light", "dark"]) {
    await navigate(theme);
    for (const width of widths) {
      await viewport(width);
      await evaluate(`(() => { localStorage.setItem("haribol-theme", ${JSON.stringify(theme)}); document.documentElement.dataset.theme = ${JSON.stringify(theme)}; document.documentElement.style.colorScheme = ${JSON.stringify(theme)}; })()`);
      await evaluate(`(() => {
        const section = document.querySelector('[data-kenya-location-section]');
        section.scrollIntoView({ block: 'center' });
      })()`);
      await pause(120);
      await evaluate(`(() => { localStorage.setItem("haribol-theme", ${JSON.stringify(theme)}); document.documentElement.dataset.theme = ${JSON.stringify(theme)}; document.documentElement.style.colorScheme = ${JSON.stringify(theme)}; })()`);
      const metrics = await evaluate(`(() => {
        const section = document.querySelector('[data-kenya-location-section]');
        const map = section?.querySelector('[data-kenya-map]');
        const country = map?.querySelector('svg path[class*="countryShape"]');
        const detail = section?.querySelector('[data-location-detail]');
        const address = section?.querySelector('address');
        const link = section?.querySelector('aside a');
        const text = section?.textContent || '';
        const mapRect = map?.getBoundingClientRect();
        const detailRect = detail?.getBoundingClientRect();
        const linkRect = link?.getBoundingClientRect();
        return {
          theme: document.documentElement.dataset.theme,
          section: Boolean(section), map: Boolean(map), countryPathLength: country?.getAttribute('d')?.length || 0,
          detail: Boolean(detail), address: address?.innerText,
          primaryLocation: text.includes('Mlolongo · operating base') && text.includes('Primary location'),
          referenceLocation: text.includes('Nairobi · nearby reference city') && text.includes('Nearby reference'),
          mapVisible: Boolean(mapRect && mapRect.width > 200 && mapRect.height > 250),
          detailVisible: Boolean(detailRect && detailRect.width > 150 && detailRect.height > 90),
          ctaVisible: Boolean(linkRect && linkRect.width > 120 && linkRect.height >= 44),
          mapHref: link?.href,
          headingVisible: section?.querySelector('h2')?.getBoundingClientRect().height > 0,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          commerceHidden: !/add to cart|buy now|checkout|sale badge/i.test(section?.textContent || ''),
        };
      })()`);
      const passed = metrics.theme === theme && metrics.section && metrics.map && metrics.countryPathLength > 3000
        && metrics.detail && metrics.address === "Emerald Business Park\nKutch Rd\nMlolongo\nKenya"
        && metrics.primaryLocation && metrics.referenceLocation && metrics.mapVisible && metrics.detailVisible
        && metrics.ctaVisible && metrics.mapHref?.startsWith("https://www.google.com/maps/place/") && metrics.headingVisible
        && !metrics.overflow && metrics.commerceHidden;
      results.push({ theme, width, passed, ...metrics });
    }
  }

  await viewport(1440, 1000);
  await navigate("light");
  await screenshotSection("kenya-light-desktop.jpg");
  await navigate("dark");
  await screenshotSection("kenya-dark-desktop.jpg");

  await viewport(390, 844);
  await navigate("light");
  await screenshotSection("kenya-light-mobile.jpg");
  await navigate("dark");
  await screenshotSection("kenya-dark-mobile.jpg");

  await viewport(1440, 1000);
  await navigate("light");
  const mapNodeId = await (async () => {
    const { root } = await command("DOM.getDocument", { depth: 0 });
    const { nodeId } = await command("DOM.querySelector", { nodeId: root.nodeId, selector: "[data-kenya-map]" });
    await command("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: ["hover"] });
    return nodeId;
  })();
  await pause(400);
  const interaction = await evaluate(`(() => ({
    signalAnimation: getComputedStyle(document.querySelector('[class*="mlolongoSignal"]')).animationName,
    lineOffset: getComputedStyle(document.querySelector('[class*="localRelationshipLine"]')).strokeDashoffset,
  }))()`);
  await screenshotSection("kenya-marker-state.jpg");
  await command("CSS.forcePseudoState", { nodeId: mapNodeId, forcedPseudoClasses: [] });

  await command("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await navigate("light");
  const reducedMotion = await evaluate(`(() => {
    const signal = document.querySelector('[class*="mlolongoSignal"]');
    const shape = document.querySelector('[class*="countryShape"]');
    return { signalAnimation: getComputedStyle(signal).animationName, shapeDuration: getComputedStyle(shape).transitionDuration };
  })()`);
  await screenshotSection("kenya-reduced-motion.jpg", 1_700);

  const failed = results.filter((result) => !result.passed);
  const report = { origin, generatedAt: new Date().toISOString(), results, interaction, reducedMotion, browserErrors, failed: failed.length };
  await writeFile(join(outputDirectory, "browser-validation.json"), `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Kenya browser validation: ${results.length - failed.length}/${results.length} responsive states passed.`);
  console.log(`Interaction: animation=${interaction.signalAnimation}, line offset=${interaction.lineOffset}.`);
  console.log(`Reduced motion: animation=${reducedMotion.signalAnimation}, duration=${reducedMotion.shapeDuration}.`);
  console.log(`Browser errors: ${browserErrors.length}.`);
  const reducedDuration = Number.parseFloat(reducedMotion.shapeDuration);
  if (failed.length || browserErrors.length || interaction.signalAnimation === "none" || reducedMotion.signalAnimation !== "none" || reducedDuration > 0.001) process.exitCode = 1;
} finally {
  socket.close();
  chrome.kill();
  await new Promise((resolveExit) => {
    if (chrome.exitCode !== null) resolveExit();
    else chrome.once("exit", resolveExit);
    setTimeout(resolveExit, 2_000);
  });
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rm(profileDirectory, { recursive: true, force: true });
      break;
    } catch (error) {
      if (attempt === 4) console.warn(`Unable to remove temporary Chrome profile: ${error.message}`);
      else await pause(200 * (attempt + 1));
    }
  }
}
