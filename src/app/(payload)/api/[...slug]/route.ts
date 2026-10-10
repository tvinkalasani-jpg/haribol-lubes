import config from "@payload-config";
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from "@payloadcms/next/routes";

import { cmsEnvironment } from "@/cms/environment";

type Handler = (request: Request, context: { params: Promise<{ slug: string[] }> }) => Promise<Response>;
const unavailable = async () => Response.json({ error: "CMS is not configured." }, { status: 503 });
const guarded = (handler: Handler): Handler => cmsEnvironment.configured ? handler : unavailable;

export const GET = guarded((request, context) => REST_GET(config)(request, context));
export const POST = guarded((request, context) => REST_POST(config)(request, context));
export const DELETE = guarded((request, context) => REST_DELETE(config)(request, context));
export const PATCH = guarded((request, context) => REST_PATCH(config)(request, context));
export const PUT = guarded((request, context) => REST_PUT(config)(request, context));
export const OPTIONS = guarded((request, context) => REST_OPTIONS(config)(request, context));
