import type { ServerFunctionClient } from "payload";
import type { ReactNode } from "react";

import "@payloadcms/next/css";

import config from "@payload-config";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";

import { cmsEnvironment } from "@/cms/environment";

import { importMap } from "./admin/importMap";

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default function PayloadLayout({ children }: { children: ReactNode }) {
  if (!cmsEnvironment.configured) return <html lang="en"><body>{children}</body></html>;
  return <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>{children}</RootLayout>;
}
