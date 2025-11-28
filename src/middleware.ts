import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import type { NextRequest } from "next/server";
import { featureFlags, protectedRoutes } from "~/constants";

const isLocal = process.env.NODE_ENV === "development";
const isStaging = process.env.VERCEL_ENV === "preview";
const isProduction = process.env.VERCEL_ENV === "production";

// API paths that bypass staging cookie check (have their own auth)
const STAGING_BYPASS_PATHS = ["/api/cron/", "/api/queue/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaging) {
    // Check if path should bypass staging cookie check
    const shouldBypassStagingCheck = STAGING_BYPASS_PATHS.some((path) =>
      pathname.startsWith(path),
    );

    if (!shouldBypassStagingCheck) {
      // Check staging cookie on EVERY other request
      const stagingCookie = request.cookies.get("staging_secret");
      const isAuthorizedForStaging =
        stagingCookie?.value === process.env.STAGING_SECRET;

      if (!isAuthorizedForStaging) {
        // API routes: Return 403
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Forbidden - Staging access required" },
            { status: 403 },
          );
        }

        // Page routes: Redirect to /staging
        return NextResponse.redirect(new URL("/staging", request.url));
      }
    }
  }

  // prod
  if (isProduction && pathname === "/staging") {
    return NextResponse.redirect(new URL("/", request.url));
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

  if (!isLocal) {
    for (const [, feature] of Object.entries(featureFlags)) {
      if (pathname.startsWith(feature.href) && !feature.enabled) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
