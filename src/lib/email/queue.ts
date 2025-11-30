import { redis } from "~/lib/redis/client";

export interface EmailNotificationJob {
  trackerId: string;
  userId: string;
  userEmail: string;
  userName: string;
  repoFullName: string;
  events: Array<{
    id: string;
    type: string;
    title: string;
    url: string;
    author: string;
    timestamp: string;
  }>;
}

const QUEUE_KEY = "email-notifications-queue";

/**
 * Add email notification job to queue
 */
export async function queueEmailNotification(
  job: EmailNotificationJob,
): Promise<void> {
  try {
    // Store as JSON string
    await redis.lpush(QUEUE_KEY, JSON.stringify(job));
  } catch (error) {
    console.error("[Email Queue] Failed to add job:", error);
    throw error;
  }
}

/**
 * Get next job from queue
 */
export async function getNextEmailJob(): Promise<EmailNotificationJob | null> {
  try {
    // Get as string and parse manually
    const job = await redis.rpop(QUEUE_KEY);
    if (!job) return null;

    // If job is already an object (auto-deserialized), return it
    if (typeof job === "object") {
      return job as EmailNotificationJob;
    }

    // Otherwise parse the string
    return JSON.parse(job) as EmailNotificationJob;
  } catch (error) {
    console.error("[Email Queue] Failed to get job:", error);
    return null;
  }
}

/**
 * Get queue length
 */
export async function getQueueLength(): Promise<number> {
  try {
    const length = await redis.llen(QUEUE_KEY);
    return length ?? 0;
  } catch (error) {
    console.error("[Email Queue] Failed to get queue length:", error);
    return 0;
  }
}
