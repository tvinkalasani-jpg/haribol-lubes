import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isStagingAccessAuthorized } from "@/lib/security/staging-access";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/health" || request.nextUrl.pathname === "/api/readiness") {
    return NextResponse.next();
  }
  if (isStagingAccessAuthorized(request.headers.get("authorization"))) {
    const requestHeaders = new Headers(request.headers);
    // Basic Auth belongs to the staging perimeter. Do not forward it to
    // Payload, which uses its own cookie/Bearer authentication.
    requestHeaders.delete("authorization");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  return new NextResponse("Staging access requires authentication.", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": 'Basic realm="Haribol staging", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
