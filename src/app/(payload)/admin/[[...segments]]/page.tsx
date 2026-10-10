import type { Metadata } from "next";
import { notFound } from "next/navigation";

import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";

import { cmsEnvironment } from "@/cms/environment";

import { importMap } from "../importMap";

type Args = { params: Promise<{ segments: string[] }>; searchParams: Promise<Record<string, string | string[]>> };

export const generateMetadata = (args: Args): Promise<Metadata> => cmsEnvironment.configured ? generatePageMetadata({ config, ...args }) : Promise.resolve({ title: "Not found" });

export default function Page(args: Args) {
  if (!cmsEnvironment.configured) notFound();
  return RootPage({ config, importMap, ...args });
}
