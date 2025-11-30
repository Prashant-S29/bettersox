import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { user as users } from "~/server/db/schema/db.schema.user";
import { trackedRepos, eventsLog } from "~/server/db/schema/db.schema.tracker";
import { getRepoActivity } from "~/lib/github/queries";
import { generateActivitySignature } from "./signature";
import { EventDetector, type DetectedEvent } from "./detector";
import {
  getCachedActivity,
  setCachedActivity,
} from "~/lib/cache/activity-cache";
import { createHash } from "crypto";

import { queueEmailNotification } from "~/lib/email/queue";

interface ProcessResult {
  trackerId: string;
  repoFullName: string;
  eventsDetected: number;
  events: DetectedEvent[];
  error?: string;
}

/**
 * Generate a unique hash for an event (to fit in 64 char limit)
 */
function generateEventHash(event: DetectedEvent): string {
  const uniqueString = `${event.type}-${event.timestamp}-${event.url}`;
  return createHash("sha256").update(uniqueString).digest("hex");
}

/**
 * Check if an event already exists in the database
 */
async function eventExists(
  trackerId: string,
  eventHash: string,
): Promise<boolean> {
  const existing = await db.query.eventsLog.findFirst({
    where: and(
      eq(eventsLog.trackedRepoId, trackerId),
      eq(eventsLog.eventSignature, eventHash),
    ),
  });
  return !!existing;
}

/**
 * Process a single tracker - check for new activity
 */
export async function processTracker(
  trackerId: string,
): Promise<ProcessResult> {
  const result: ProcessResult = {
    trackerId,
    repoFullName: "",
    eventsDetected: 0,
    events: [],
  };

  try {
    // Get tracker from database
    const tracker = await db.query.trackedRepos.findFirst({
      where: eq(trackedRepos.id, trackerId),
    });

    if (!tracker) {
      throw new Error(`Tracker ${trackerId} not found`);
    }

    result.repoFullName = tracker.repoFullName;

    // Skip if paused
    if (tracker.isPaused) {
      return result;
    }

    // Skip if not active
    if (!tracker.isActive) {
      return result;
    }

    // Get cached activity data
    const cachedData = await getCachedActivity(
      tracker.repoOwner,
      tracker.repoName,
    );

    // Fetch new activity data from GitHub
    const newData = await getRepoActivity(tracker.repoOwner, tracker.repoName);

    // Generate new signature
    const newSignature = generateActivitySignature(newData);

    // Compare signatures
    if (tracker.lastActivitySignature === newSignature) {
      // Update last checked time
      await db
        .update(trackedRepos)
        .set({
          lastCheckedAt: new Date(),
          errorCount: 0, // Reset error count on success
          lastError: null,
        })
        .where(eq(trackedRepos.id, tracker.id));

      // Cache the data
      await setCachedActivity(tracker.repoOwner, tracker.repoName, newData);

      return result;
    }

    // Detect events using cached data
    const detector = new EventDetector(
      tracker.trackedEvents,
      cachedData ?? undefined,
    );
    const detectedEvents = detector.detect(newData);

    result.events = detectedEvents;

    // Filter out events that already exist in database
    let newEventsCount = 0;
    if (detectedEvents.length > 0) {
      for (const event of detectedEvents) {
        const eventHash = generateEventHash(event);

        // Check if this event already exists
        const exists = await eventExists(tracker.id, eventHash);

        if (exists) {
          continue;
        }

        // Insert new event
        await db.insert(eventsLog).values({
          trackedRepoId: tracker.id,
          eventType: event.type,
          eventData: {
            type: event.type,
            title: event.title,
            url: event.url,
            author: event.author,
            timestamp: event.timestamp,
            metadata: event.metadata,
          } as Record<string, unknown>,
          eventSignature: eventHash,
          detectedAt: new Date(),
          notificationSent: false,
        });

        newEventsCount++;
      }
    }

    result.eventsDetected = newEventsCount;

    // Queue email notification if there are new events
    if (newEventsCount > 0) {
      try {
        // Get user info
        const user = await db.query.user.findFirst({
          where: eq(users.id, tracker.userId),
        });

        if (user?.email) {
          await queueEmailNotification({
            trackerId: tracker.id,
            userId: tracker.userId,
            userEmail: user.email,
            userName: user.name,
            repoFullName: tracker.repoFullName,
            events: detectedEvents.slice(0, newEventsCount).map((event) => ({
              id: generateEventHash(event),
              type: event.type,
              title: event.title,
              url: event.url,
              author: event.author,
              timestamp: event.timestamp,
            })),
          });
        } else {
          console.warn(
            `[Tracker] ${tracker.repoFullName} - No email found for user ${tracker.userId}`,
          );
        }
      } catch (emailError) {
        console.error(
          `[Tracker] ${tracker.repoFullName} - Failed to queue email:`,
          emailError,
        );
        // Don't fail the entire process if email queuing fails
      }
    }

    // Update tracker with new signature
    await db
      .update(trackedRepos)
      .set({
        lastActivitySignature: newSignature,
        lastCheckedAt: new Date(),
        errorCount: 0,
        lastError: null,
      })
      .where(eq(trackedRepos.id, tracker.id));

    // Cache the new data
    await setCachedActivity(tracker.repoOwner, tracker.repoName, newData);

    return result;
  } catch (error) {
    console.error(`[Tracker] Error processing ${trackerId}:`, error);

    result.error = "Unknown error";

    // Update error count
    try {
      const tracker = await db.query.trackedRepos.findFirst({
        where: eq(trackedRepos.id, trackerId),
      });

      if (tracker) {
        const newErrorCount = (tracker.errorCount || 0) + 1;

        await db
          .update(trackedRepos)
          .set({
            errorCount: newErrorCount,
            lastError: "Unknown error",
            lastCheckedAt: new Date(),
            // Deactivate after 10 consecutive errors
            isActive: newErrorCount < 10,
          })
          .where(eq(trackedRepos.id, tracker.id));
      }
    } catch (updateError) {
      console.error(`[Tracker] Failed to update error count:`, updateError);
    }

    return result;
  }
}

/**
 * Process multiple trackers in batches
 */
export async function processTrackersBatch(
  trackerIds: string[],
  batchSize = 5,
): Promise<ProcessResult[]> {
  const results: ProcessResult[] = [];

  // Process in batches to avoid overwhelming GitHub API
  for (let i = 0; i < trackerIds.length; i += batchSize) {
    const batch = trackerIds.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map((id) => processTracker(id)),
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        console.error("[Tracker] Batch processing error:", result.reason);
      }
    }

    // Wait 2 seconds between batches to respect rate limits
    if (i + batchSize < trackerIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return results;
}
