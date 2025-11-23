import { env } from "~/env";

export function validateCronRequest(request: Request): boolean {
  // In development, allow without secret
  if (env.NODE_ENV === "development") {
    console.log("[Cron] Running in development mode - skipping auth");
    return true;
  }

  // Check Vercel Cron secret
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    console.error("[Cron] Missing authorization header");
    return false;
  }

  // Vercel sends: Bearer <CRON_SECRET>
  const token = authHeader.replace("Bearer ", "");

  if (!env.CRON_SECRET) {
    console.error("[Cron] CRON_SECRET not configured");
    return false;
  }

  if (token !== env.CRON_SECRET) {
    console.error("[Cron] Invalid cron secret");
    return false;
  }

  return true;
}
