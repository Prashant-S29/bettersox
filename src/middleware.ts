import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { featureFlags } from "~/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // skip for dev env
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  for (const [, feature] of Object.entries(featureFlags)) {
    if (pathname.startsWith(feature.href) && !feature.enabled) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
