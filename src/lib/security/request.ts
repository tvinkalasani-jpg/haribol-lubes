export type RequestSecurityFailure = {
  message: string;
  status: 403 | 415;
  type: "invalid_origin" | "unsupported_media_type";
};

function normalizedOrigin(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

export function validateJsonMutationRequest(request: Request): RequestSecurityFailure | undefined {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    return { type: "unsupported_media_type", status: 415, message: "This endpoint accepts JSON requests only." };
  }

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") {
    return { type: "invalid_origin", status: 403, message: "The request origin is not allowed." };
  }

  const suppliedOrigin = normalizedOrigin(request.headers.get("origin"));
  if (!suppliedOrigin) return undefined;

  const requestOrigin = normalizedOrigin(request.url);
  const configuredOrigin = normalizedOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? null);
  if (suppliedOrigin !== requestOrigin && suppliedOrigin !== configuredOrigin) {
    return { type: "invalid_origin", status: 403, message: "The request origin is not allowed." };
  }
  return undefined;
}
