type SecurityEnvironment = Record<string, string | undefined>;

export function buildContentSecurityPolicy(environment: SecurityEnvironment = process.env): string {
  const imageSources = ["'self'", "data:", "blob:"];

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imageSources.join(" ")}`,
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];

  if (environment.SECURITY_HSTS_ENABLED === "true") directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export function securityHeaders(environment: SecurityEnvironment = process.env) {
  const production = environment.NODE_ENV === "production";
  const requestedMode = environment.SECURITY_CSP_MODE;
  const cspMode = requestedMode === "off" || requestedMode === "report-only" || requestedMode === "enforce"
    ? requestedMode
    : production ? "enforce" : "report-only";
  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  ];

  if (cspMode !== "off") {
    headers.push({
      key: cspMode === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
      value: buildContentSecurityPolicy(environment),
    });
  }
  if (production && environment.SECURITY_HSTS_ENABLED === "true") {
    headers.push({ key: "Strict-Transport-Security", value: "max-age=86400" });
  }
  if (environment.SEO_INDEXING_MODE !== "production") {
    headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" });
  }
  return headers;
}
