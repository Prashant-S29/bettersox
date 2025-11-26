import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import type { NextRequest } from "next/server";
import { featureFlags, protectedRoutes } from "~/constants";

const isStaging = process.env.VERCEL_ENV === "preview";
const isProduction = process.env.VERCEL_ENV === "production";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // staging env
  if (isStaging) {
    if (pathname === "/staging") {
      return NextResponse.next();
    }

    // Check for staging cookie
    const stagingCookie = request.cookies.get("staging_secret");
    const isAuthorizedForStaging =
      stagingCookie?.value === process.env.STAGING_SECRET;

    if (!isAuthorizedForStaging) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Forbidden - Staging access required" },
          { status: 403 },
        );
      }

      return NextResponse.redirect(new URL("/staging", request.url));
    }
  }

  if (isProduction && pathname === "/staging") {
    // Redirect to referrer or home
    const referer = request.headers.get("referer");
    const redirectUrl = referer ? new URL(referer).pathname : "/";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
