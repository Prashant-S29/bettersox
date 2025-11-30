import { NextResponse } from "next/server";
import { validateCronRequest } from "~/lib/security/cron";
import { acquireLock, releaseLock } from "~/lib/cache/job-lock";
import { getNextEmailJob } from "~/lib/email/queue";
import { sendEventNotification } from "~/lib/email/sender";
import { db } from "~/server/db";
import { eventsLog } from "~/server/db/schema/db.schema.tracker";
import { eq, and, inArray } from "drizzle-orm";

const LOCK_NAME = "send-email-job";
const MAX_BATCH_SIZE = 10;
const DELAY_BETWEEN_EMAILS = 100; // ms

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds timeout

/**
 * Send Email Queue Cron Job
 * Triggered by GitHub Actions (2 minutes after check-trackers)
 * Processes pending email notifications from the queue
 */
export async function GET(request: Request) {
  const startTime = Date.now();
  let processedCount = 0;
  let errorCount = 0;

  try {
    // Validate request is from authorized source (GitHub Actions)
    if (!validateCronRequest(request)) {
      console.error("[Email Queue] Unauthorized cron request attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Acquire lock to prevent concurrent runs
    const lockAcquired = await acquireLock(LOCK_NAME);

    if (!lockAcquired) {
      return NextResponse.json({
        success: true,
        message: "Job already running",
        skipped: true,
        timestamp: new Date().toISOString(),
      });
    }

    try {
      // Process email queue in batches
      for (let i = 0; i < MAX_BATCH_SIZE; i++) {
        const job = await getNextEmailJob();

        if (!job) {
          break;
        }

        // Send email notification
        const result = await sendEventNotification(job);

        if (result.success) {
          processedCount++;

          // Mark events as notified in database
          try {
            const eventIds = job.events.map((e) => e.id);

            await db
              .update(eventsLog)
              .set({
                notificationSent: true,
                notifiedAt: new Date(),
              })
              .where(
                and(
                  eq(eventsLog.trackedRepoId, job.trackerId),
                  inArray(eventsLog.eventSignature, eventIds),
                ),
              );
          } catch (dbError) {
            console.error(
              "[Email Queue] Failed to update events_log:",
              dbError,
            );
            // Don't fail the job if DB update fails - email was sent successfully
          }
        } else {
          errorCount++;
          console.error(
            `[Email Queue] Failed to send email to ${job.userEmail}: ${result.error}`,
          );

          // TODO: Implement retry logic (dead letter queue)
          // For now, we just log the error and continue
        }

        // Rate limiting: delay between emails
        if (i < MAX_BATCH_SIZE - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, DELAY_BETWEEN_EMAILS),
          );
        }
      }

      const duration = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        message: "Email processing completed",
        processedCount,
        successfulCount: processedCount,
        failedCount: errorCount,
        duration,
        timestamp: new Date().toISOString(),
      });
    } finally {
      // Always release lock
      await releaseLock(LOCK_NAME);
    }
  } catch (error) {
    console.error("[Email Queue] Job failed:", error);

    // Try to release lock on error
    try {
      await releaseLock(LOCK_NAME);
    } catch (lockError) {
      console.error("[Email Queue] Failed to release lock:", lockError);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        processedCount,
        failedCount: errorCount,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
