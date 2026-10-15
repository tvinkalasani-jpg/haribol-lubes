import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const read=(path)=>readFileSync(resolve(process.cwd(),path),"utf8");
const industry=read("src/components/industry/industry-pages.tsx");
const about=read("src/app/(website)/about/page.tsx");
const contact=read("src/components/contact/contact-page.tsx");
const finderPage=read("src/app/(website)/product-finder/page.tsx");
const finder=read("src/components/catalogue/product-finder.tsx");
const resources=read("src/app/(website)/resources/page.tsx");
const insights=read("src/app/(website)/insights/page.tsx");
const rfq=read("src/components/forms/rfq-page.tsx");
const hero=read("src/components/layout/supporting-page-hero.tsx");
const heroStyles=read("src/components/layout/supporting-page-hero.module.css");
const site=read("src/config/site.ts");
const contentRepository=read("src/features/content/content-repository.ts");
const packageJson=JSON.parse(read("package.json"));
const ui=[industry,about,contact,finderPage,finder,resources,insights,rfq,hero].join("\n");
const checks=[
["all nine approved industries remain data driven",industry.includes("industries.map")&&industry.includes("09 sectors")],
["industry detail relationships remain catalogue driven",industry.includes("getProductsByIndustry")&&industry.includes("relevantCategoryIds")],
["industry pages retain application context",industry.includes("matchedApplications")],
["industry index exposes Product Finder",industry.includes('href="/product-finder"')],
["industry RFQ and WhatsApp routes remain present",industry.includes("Request a Quote")&&industry.includes("WhatsAppLink")],
["about uses centralized company configuration",about.includes("siteConfig.companyName")&&about.includes("siteConfig.city")],
["about retains Mastermax relationship",about.includes("featuredBrand")&&about.includes("Mastermax within Haribol")],
["about uses verified operating-base configuration",about.includes("siteConfig.businessAddress.mapsUrl")],
["contact methods remain conditional",contact.includes("siteConfig.publicEmail")&&contact.includes("normalizeWhatsAppNumber")],
["contact keeps verified Maps destination",contact.includes("siteConfig.businessAddress.mapsUrl")],
["contact does not invent hours",contact.includes("siteConfig.businessHours &&")],
["Product Finder business logic remains isolated",finderPage.includes("createProductFinderDataset")&&finder.includes("findProducts")],
["Product Finder retains accessibility fieldsets",finder.includes("<fieldset")&&finder.includes('aria-live="polite"')],
["resources remain repository sourced",resources.includes("getPublicResources")],
["resources retain controlled downloads",resources.includes("resource.downloadHref")],
["insights remain repository sourced",insights.includes("getPublicInsights")],
["content repository retains publication gates",contentRepository.includes("overrideAccess: false")&&contentRepository.includes('collection: "insights"')&&contentRepository.includes('collection: "resources"')],
["RFQ form contract remains unchanged",rfq.includes("<RfqForm {...props}")],
["RFQ preserves product and industry context",rfq.includes("Selected product")&&rfq.includes("Industry context")],
["shared supporting hero is server rendered",!hero.includes('"use client"')&&!hero.includes("useEffect")],
["shared hero preserves breadcrumbs",hero.includes("Breadcrumbs")],
["shared hero supports distinct visual variants",hero.includes('"finder" | "resources" | "insights"')],
["shared hero has mobile treatment",heroStyles.includes("@media(max-width:48rem)")],
["shared hero uses semantic theme tokens",heroStyles.includes("var(--color-background")||heroStyles.includes("var(--color-panel")],
["Mlolongo remains configured physical locality",site.includes('city: "Mlolongo"')],
["Nairobi is not introduced in supporting UI",!ui.includes("Nairobi")],
["no commerce action is introduced",!/Add to Cart|Buy Now|Checkout|M-Pesa|card payment|cash on delivery/i.test(ui)],
["no price or stock claim is introduced",!/KSh [0-9]|In Stock|Guaranteed stock|same-day delivery/i.test(ui)],
["no unsupported leadership claim is introduced",!/leading supplier|number one|trusted by thousands|East Africa leader/i.test(ui)],
["no heavy visual dependency was added",!Object.keys(packageJson.dependencies).some((name)=>["three","gsap","swiper","@react-three/fiber"].includes(name))],
];
let failures=0;checks.forEach(([label,pass],i)=>{if(!pass)failures++;console.log(`${pass?"PASS":"FAIL"} ${String(i+1).padStart(2,"0")} ${label}`)});if(failures)process.exit(1);console.log(`Supporting-page validation complete: ${checks.length}/${checks.length} checks passed.`);
