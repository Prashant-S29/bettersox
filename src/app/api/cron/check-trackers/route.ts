import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { trackedRepos } from "~/server/db/schema/db.schema.tracker";
import { eq } from "drizzle-orm";
import { validateCronRequest } from "~/lib/security/cron";
import { acquireLock, releaseLock } from "~/lib/cache/job-lock";
import { processTrackersBatch } from "~/lib/tracking/processor";

const LOCK_NAME = "check-trackers-job";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds timeout

/**
 * Check Trackers Cron Job
 * Triggered by GitHub Actions every 5 minutes
 * Processes all active trackers and detects new events
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // Validate request is from authorized source (GitHub Actions)
    if (!validateCronRequest(request)) {
      console.error("[Cron] Unauthorized cron request attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting tracker check job...");

    // Acquire lock to prevent concurrent runs
    const lockAcquired = await acquireLock(LOCK_NAME);

    if (!lockAcquired) {
      console.log("[Cron] Job already running, skipping...");
      return NextResponse.json({
        success: true,
        message: "Job already running",
        skipped: true,
        timestamp: new Date().toISOString(),
      });
    }

    try {
      // Fetch all active trackers
      const activeTrackers = await db.query.trackedRepos.findMany({
        where: eq(trackedRepos.isActive, true),
        columns: {
          id: true,
          repoFullName: true,
          isPaused: true,
        },
      });

      console.log(`[Cron] Found ${activeTrackers.length} active trackers`);

      if (activeTrackers.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No active trackers to process",
          processedCount: 0,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });
      }

      // Process trackers in batches
      const trackerIds = activeTrackers.map((t) => t.id);
      const results = await processTrackersBatch(trackerIds, 5);

      // Calculate statistics
      const totalEvents = results.reduce((sum, r) => sum + r.eventsDetected, 0);
      const errors = results.filter((r) => r.error).length;
      const successful = results.length - errors;
      const duration = Date.now() - startTime;

      console.log(`[Cron] Job completed in ${duration}ms`);
      console.log(`[Cron] Processed: ${results.length} trackers`);
      console.log(`[Cron] Successful: ${successful}`);
      console.log(`[Cron] Errors: ${errors}`);
      console.log(`[Cron] Total events detected: ${totalEvents}`);

      return NextResponse.json({
        success: true,
        message: "Tracker check completed",
        processedCount: results.length,
        successfulCount: successful,
        errorCount: errors,
        totalEventsDetected: totalEvents,
        duration,
        timestamp: new Date().toISOString(),
        results: results.map((r) => ({
          trackerId: r.trackerId,
          repoFullName: r.repoFullName,
          eventsDetected: r.eventsDetected,
          error: r.error,
        })),
      });
    } finally {
      // Always release lock
      await releaseLock(LOCK_NAME);
    }
  } catch (error) {
    console.error("[Cron] Job failed:", error);

    // Try to release lock on error
    try {
      await releaseLock(LOCK_NAME);
    } catch (lockError) {
      console.error("[Cron] Failed to release lock:", lockError);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
