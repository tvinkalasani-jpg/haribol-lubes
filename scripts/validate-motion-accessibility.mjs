import { readFile } from "node:fs/promises";

const files = {
  globals: "src/styles/globals.css",
  tokens: "src/styles/tokens.css",
  header: "src/components/layout/site-header.module.css",
  headerController: "src/components/layout/header-controller.tsx",
  footer: "src/components/layout/site-footer.module.css",
  breadcrumbs: "src/components/catalogue/breadcrumbs.module.css",
  catalogue: "src/components/catalogue/catalogue-search.module.css",
  layout: "src/app/(website)/layout.tsx",
  rfq: "src/components/forms/rfq-form.tsx",
  contact: "src/components/contact/contact-form.tsx",
};

const source = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")])),
);
const checks = [];
const check = (name, condition) => checks.push({ name, passed: Boolean(condition) });

check("global keyboard focus ring", /:focus-visible\s*{[^}]*outline:\s*3px/s.test(source.globals));
check("skip link supplied", /className="skip-link"/.test(source.layout));
check("semantic main landmark", /<main id="main-content">/.test(source.layout));
check("reduced motion disables smooth scroll", /prefers-reduced-motion:[^}]+reduce[\s\S]*scroll-behavior:\s*auto/.test(source.globals));
check("reduced motion shortens transitions", /transition-duration:\s*0\.01ms\s*!important/.test(source.globals));
check("reduced motion stops repeating animation", /animation-iteration-count:\s*1\s*!important/.test(source.globals));
check("controlled fast motion token", /--duration-fast:\s*120ms/.test(source.tokens));
check("controlled normal motion token", /--duration-normal:\s*220ms/.test(source.tokens));
check("controlled slow motion token", /--duration-slow:\s*420ms/.test(source.tokens));
check("controlled reveal motion token", /--duration-reveal:\s*700ms/.test(source.tokens));
check("standard easing token", /--ease-standard:\s*cubic-bezier/.test(source.tokens));
check("emphasized easing token", /--ease-emphasized:\s*cubic-bezier/.test(source.tokens));
check("mobile fields avoid viewport zoom", /max-width:\s*48rem[\s\S]*font-size:\s*1rem/.test(source.globals));
check("interactive controls use manipulation touch action", /touch-action:\s*manipulation/.test(source.globals));
check("long content can wrap", /overflow-wrap:\s*break-word/.test(source.globals));
check("anchor targets clear fixed header", /scroll-margin-top:/.test(source.globals));
check("header top safe area", /safe-area-inset-top/.test(source.header));
check("mobile panel bottom safe area", /safe-area-inset-bottom/.test(source.header));
check("filter footer bottom safe area", /safe-area-inset-bottom/.test(source.catalogue));
check("footer bottom safe area", /safe-area-inset-bottom/.test(source.footer));
check("short viewport menu treatment", /max-height:\s*34rem/.test(source.header));
check("coarse pointer treatment", /pointer:\s*coarse/.test(source.header));
check("breadcrumb targets are 44px", /min-height:\s*2\.75rem/.test(source.breadcrumbs));
check("breadcrumbs support focus", /breadcrumbs a:focus-visible/.test(source.breadcrumbs));
check("header scroll listener is passive", /addEventListener\("scroll",\s*handleScroll,\s*{\s*passive:\s*true\s*}/.test(source.headerController));
check("header scroll updates are frame-batched", /requestAnimationFrame\(updateScrollState\)/.test(source.headerController));
check("header scroll avoids React state", !/useState/.test(source.headerController));
check("mobile dialog traps keyboard focus", /event\.key !== "Tab"/.test(source.headerController));
check("mobile dialog closes with Escape", /event\.key === "Escape"/.test(source.headerController));
check("closed mobile regions become inert", /toggleAttribute\("inert"/.test(source.headerController));
check("RFQ fields use autocomplete", /autoComplete="name"/.test(source.rfq) && /autoComplete="email"/.test(source.rfq));
check("RFQ invalid fields expose aria-invalid", /aria-invalid=/.test(source.rfq));
check("contact fields use autocomplete", /autoComplete="organization"/.test(source.contact) && /autoComplete="tel"/.test(source.contact));
check("contact invalid fields expose aria-invalid", /aria-invalid=/.test(source.contact));
check("no mouse-only React interactions in audited controls", !/onMouse(?:Enter|Leave|Over|Out)/.test(source.headerController + source.rfq + source.contact));

const failed = checks.filter((item) => !item.passed);
for (const item of checks) console.log(`${item.passed ? "PASS" : "FAIL"} ${item.name}`);
console.log(`\nMotion/mobile/accessibility validation: ${checks.length - failed.length}/${checks.length} checks passed.`);
if (failed.length) process.exitCode = 1;
