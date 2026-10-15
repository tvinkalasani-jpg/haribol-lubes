import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const targets=[
  {id:"industries-light",path:"/industries",theme:"light"},{id:"industries-dark",path:"/industries",theme:"dark"},
  {id:"about-light",path:"/about",theme:"light"},{id:"contact-light",path:"/contact",theme:"light"},
  {id:"rfq-light",path:"/request-a-quote",theme:"light"},{id:"finder-light",path:"/product-finder",theme:"light"},
];
const root=resolve("docs/phase-31i/lighthouse");await mkdir(root,{recursive:true});
function run(target){return new Promise((resolveRun,reject)=>{const out=resolve(root,target.id);const child=spawn(process.execPath,["scripts/run-phase31h-lighthouse.mjs"],{stdio:"inherit",windowsHide:true,env:{...process.env,LIGHTHOUSE_PATH:target.path,LIGHTHOUSE_THEMES:target.theme,LIGHTHOUSE_OUTPUT_DIRECTORY:out}});child.on("error",reject);child.on("exit",code=>code===0?resolveRun(out):reject(new Error(`${target.id} exited ${code}`)))})}
const reports=[];for(const target of targets){const directory=await run(target);const report=JSON.parse(await readFile(resolve(directory,"summary.json"),"utf8"));reports.push({id:target.id,path:target.path,theme:target.theme,runs:report.runs,median:report.medians[target.theme]})}
await writeFile(resolve(root,"summary.json"),JSON.stringify({generatedAt:new Date().toISOString(),profile:"Lighthouse mobile / simulated throttling",reports},null,2)+"\n");
console.log("Phase 31I Lighthouse complete.");
