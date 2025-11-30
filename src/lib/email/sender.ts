import { Resend } from "resend";
import { env } from "~/env";
import type { EmailNotificationJob } from "./queue";
import { renderTrackerNotificationEmail } from "./render";

const resend = new Resend(env.RESEND_API_KEY);

const FROM_EMAIL = "onboarding@resend.dev";

/**
 * Send email notification for repository events
 */
export async function sendEventNotification(
  job: EmailNotificationJob,
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    // Generate subject
    const subject = generateSubject(job);

    // Render HTML and plain text versions
    const { html, text } = await renderTrackerNotificationEmail({
      userName: job.userName,
      repoFullName: job.repoFullName,
      events: job.events,
      trackerId: job.trackerId,
    });

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: job.userEmail,
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error("[Email] Failed to send:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("[Email] Exception while sending:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate email subject based on events
 */
function generateSubject(job: EmailNotificationJob): string {
  const { repoFullName, events } = job;

  if (events.length === 1) {
    const event = events[0]!;
    return getEventSubject(event.type, repoFullName);
  }

  return `[BetterSox] ${events.length} new events in ${repoFullName}`;
}

function getEventSubject(eventType: string, repoFullName: string): string {
  const typeMap: Record<string, string> = {
    new_pr: `[BetterSox] New PR in ${repoFullName}`,
    new_issue: `[BetterSox] New issue in ${repoFullName}`,
    pr_merged_to_default: `[BetterSox] PR merged in ${repoFullName}`,
    new_release: `[BetterSox] New release in ${repoFullName}`,
    new_fork: `[BetterSox] New fork of ${repoFullName}`,
    new_branch: `[BetterSox] New branch in ${repoFullName}`,
    new_contributor: `[BetterSox] New contributor in ${repoFullName}`,
    stars_milestone: `[BetterSox] ${repoFullName} reached a stars milestone!`,
  };

  if (eventType.startsWith("new_issue_with_tag:")) {
    const tag = eventType.split(":")[1];
    return `[BetterSox] New issue with "${tag}" label in ${repoFullName}`;
  }

  if (eventType.startsWith("pr_merged_to_branch:")) {
    const branch = eventType.split(":")[1];
    return `[BetterSox] PR merged to ${branch} in ${repoFullName}`;
  }

  return typeMap[eventType] ?? `[BetterSox] New event in ${repoFullName}`;
}
