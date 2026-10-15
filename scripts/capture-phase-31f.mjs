import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const origin = (process.env.MASTERMAX_QA_ORIGIN || "http://localhost:3043").replace(/\/$/, "");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDirectory = resolve("docs/phase-31f");
const profileDirectory = await mkdtemp(join(tmpdir(), "haribol-phase-31f-"));
const debuggingPort = 9337;
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
  const clip = await evaluate(`(() => { const r = document.querySelector('[data-mastermax-showcase]').getBoundingClientRect(); return { x: 0, y: scrollY + r.top, width: innerWidth, height: Math.min(r.height, ${maxHeight}), scale: 1 }; })()`);
  const shot = await command("Page.captureScreenshot", { format: "jpeg", quality: 88, fromSurface: true, captureBeyondViewport: true, clip });
  await writeFile(join(outputDirectory, name), Buffer.from(shot.data, "base64"));
}

const widths = [320, 390, 480, 768, 900, 1024, 1120, 1280, 1440, 1920];
const expectedGroups = ["engine", "hydraulic", "transmission", "compressor", "industrial", "greases"];
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
      await evaluate(`(async () => {
        const section = document.querySelector('[data-mastermax-showcase]');
        section.scrollIntoView({ block: 'center' });
        const images = [...section.querySelectorAll('img')];
        await Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise((resolveImage) => {
          image.addEventListener('load', resolveImage, { once: true });
          image.addEventListener('error', resolveImage, { once: true });
        })));
      })()`);
      const metrics = await evaluate(`(() => {
        const section = document.querySelector('[data-mastermax-showcase]');
        const visual = section?.querySelector('[data-mastermax-family-visual]');
        const packs = [...(section?.querySelectorAll('[data-family-pack]') || [])];
        const groups = [...(section?.querySelectorAll('[data-mastermax-group]') || [])];
        const labels = [...(section?.querySelectorAll('label') || [])];
        const visiblePanels = groups.filter((item) => getComputedStyle(item).display !== 'none');
        const links = [...(section?.querySelectorAll('a') || [])];
        return {
          theme: document.documentElement.dataset.theme,
          section: Boolean(section), visual: Boolean(visual), packCount: packs.length,
          groups: groups.map((item) => item.dataset.mastermaxGroup), labelCount: labels.length,
          visiblePanels: visiblePanels.length,
          labelTargetsSafe: labels.every((label) => label.getBoundingClientRect().height >= 44),
          headingVisible: section?.querySelector('h2')?.getBoundingClientRect().height > 0,
          imageReady: packs.every((pack) => { const image = pack.querySelector('img'); return image?.complete && image.naturalWidth > 0; }),
          ctas: links.slice(0, 2).map((link) => new URL(link.href).pathname),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          commerceHidden: !/add to cart|buy now|checkout|sale badge/i.test(section?.textContent || ''),
        };
      })()`);
      const passed = metrics.theme === theme && metrics.section && metrics.visual && metrics.packCount === 4
        && JSON.stringify(metrics.groups) === JSON.stringify(expectedGroups) && metrics.labelCount === 6
        && metrics.visiblePanels === 1 && metrics.labelTargetsSafe && metrics.headingVisible && metrics.imageReady
        && JSON.stringify(metrics.ctas) === JSON.stringify(["/brands/mastermax", "/request-a-quote"])
        && !metrics.overflow && metrics.commerceHidden;
      results.push({ theme, width, passed, ...metrics });
    }
  }

  await viewport(1440, 1000);
  await navigate("light");
  await screenshotSection("mastermax-light-desktop.jpg");
  await navigate("dark");
  await screenshotSection("mastermax-dark-desktop.jpg");

  await viewport(390, 844);
  await navigate("light");
  await screenshotSection("mastermax-light-mobile.jpg");
  await navigate("dark");
  await screenshotSection("mastermax-dark-mobile.jpg");

  await viewport(1440, 1000);
  await navigate("light");
  await evaluate(`(() => { const radio = document.querySelector('#mastermax-group-transmission'); radio.click(); document.querySelector('[data-mastermax-showcase]').scrollIntoView(); })()`);
  await pause(200);
  const interaction = await evaluate(`(() => ({ checked: document.querySelector('#mastermax-group-transmission').checked, visible: getComputedStyle(document.querySelector('[data-mastermax-group="transmission"]')).display }))()`);
  await screenshotSection("mastermax-transmission-state.jpg");

  await command("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await navigate("light");
  const reducedMotion = await evaluate(`(() => { const pack = document.querySelector('[data-family-pack]'); const section = document.querySelector('[data-mastermax-showcase]'); return { packDuration: getComputedStyle(pack).transitionDuration, sectionPresent: Boolean(section) }; })()`);
  await screenshotSection("mastermax-reduced-motion.jpg", 1_500);

  const failed = results.filter((result) => !result.passed);
  const report = { origin, generatedAt: new Date().toISOString(), results, interaction, reducedMotion, browserErrors, failed: failed.length };
  await writeFile(join(outputDirectory, "browser-validation.json"), `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Mastermax browser validation: ${results.length - failed.length}/${results.length} responsive states passed.`);
  console.log(`Interaction: checked=${interaction.checked}, visible=${interaction.visible}.`);
  console.log(`Reduced motion pack duration: ${reducedMotion.packDuration}.`);
  console.log(`Browser errors: ${browserErrors.length}.`);
  const reducedDuration = Number.parseFloat(reducedMotion.packDuration);
  if (failed.length || browserErrors.length || !interaction.checked || interaction.visible === "none" || reducedDuration > 0.001) process.exitCode = 1;
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
