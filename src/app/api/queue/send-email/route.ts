import { NextResponse } from "next/server";
import { getNextEmailJob } from "~/lib/email/queue";
import { sendEventNotification } from "~/lib/email/sender";
import { db } from "~/server/db";
import { eventsLog } from "~/server/db/schema/db.schema.tracker";
import { eq, and, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  console.log("[Email Queue Handler] Starting...");

  let processedCount = 0;
  let errorCount = 0;
  const maxBatchSize = 10;

  try {
    for (let i = 0; i < maxBatchSize; i++) {
      const job = await getNextEmailJob();

      if (!job) {
        console.log("[Email Queue Handler] No more jobs in queue");
        break;
      }

      console.log(`[Email Queue Handler] Processing job for ${job.userEmail}`);

      const result = await sendEventNotification(job);

      if (result.success) {
        processedCount++;
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

          console.log(
            `[Email Queue Handler] Updated ${eventIds.length} events as notified`,
          );
        } catch (dbError) {
          console.error(
            "[Email Queue Handler] Failed to update events_log:",
            dbError,
          );
        }
      } else {
        errorCount++;
        console.error(
          `[Email Queue Handler] Failed to send email: ${result.error}`,
        );

        // TODO: need to implement retry logic (dead letter queue)
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error("[Email Queue Handler] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        processed: processedCount,
        errors: errorCount,
      },
      { status: 500 },
    );
  }
}
