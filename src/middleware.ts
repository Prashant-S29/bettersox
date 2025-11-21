import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import type { NextRequest } from "next/server";
import { featureFlags, protectedRoutes } from "~/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let isAuthenticated = false;

  const sessionCookie = getSessionCookie(request);
  isAuthenticated = !!sessionCookie;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

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
