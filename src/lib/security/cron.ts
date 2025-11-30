import { env } from "~/env";

/**
 * Validates cron job requests
 * Accepts requests from:
 * - GitHub Actions (with Bearer token)
 * - Vercel Cron (if we upgrade to Pro later)
 * - Development environment (no auth required)
 */
export function validateCronRequest(request: Request): boolean {
  // In development, allow without secret
  if (env.NODE_ENV === "development") {
    console.warn("[Cron] Running in development mode - skipping auth");
    return true;
  }

  // Check authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    console.error("[Cron] Missing authorization header");
    return false;
  }

  // Expect: Bearer <CRON_SECRET>
  // This format works with both GitHub Actions and Vercel Cron
  if (!authHeader.startsWith("Bearer ")) {
    console.error("[Cron] Invalid authorization format");
    return false;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (!env.CRON_SECRET) {
    console.error("[Cron] CRON_SECRET not configured in environment");
    return false;
  }

  if (token !== env.CRON_SECRET) {
    console.error("[Cron] Invalid cron secret token");
    return false;
  }

  return true;
}
