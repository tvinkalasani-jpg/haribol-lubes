import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isStagingAccessAuthorized } from "@/lib/security/staging-access";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/health" || request.nextUrl.pathname === "/api/readiness") {
    return NextResponse.next();
  }
  if (isStagingAccessAuthorized(request.headers.get("authorization"))) return NextResponse.next();
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
