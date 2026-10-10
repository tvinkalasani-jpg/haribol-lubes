import { NotFoundPage, generatePageMetadata } from "@payloadcms/next/views";
import config from "@payload-config";

import { importMap } from "../importMap";

export const generateMetadata = () => generatePageMetadata({ config, params: Promise.resolve({ segments: ["not-found"] }), searchParams: Promise.resolve({}) });
export default function NotFound() { return NotFoundPage({ config, importMap, params: Promise.resolve({ segments: ["not-found"] }), searchParams: Promise.resolve({}) }); }
