import type { EmailNotificationJob } from "./queue";

/**
 * Generate plain text email for repository events
 */
export function generateEventNotificationEmail(job: EmailNotificationJob): {
  subject: string;
  text: string;
} {
  const { userName, repoFullName, events } = job;

  // Determine subject based on events
  let subject = "";
  if (events.length === 1) {
    const event = events[0]!;
    subject = getEventSubject(event.type, repoFullName);
  } else {
    subject = `[BetterSox] ${events.length} new events in ${repoFullName}`;
  }

  // Generate email body
  const greeting = `Hey ${userName},\n\n`;

  let body = "";
  if (events.length === 1) {
    body = generateSingleEventBody(events[0]!, repoFullName);
  } else {
    body = generateMultipleEventsBody(events, repoFullName);
  }

  const footer = `\n\n---\n\nYou're receiving this because you're tracking ${repoFullName} on BetterSox.\n\nManage your tracker: https://bettersox.dev/track\n\nBest,\nThe BetterSox Team`;

  return {
    subject,
    text: greeting + body + footer,
  };
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

  // Handle parameterized events
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

function generateSingleEventBody(
  event: EmailNotificationJob["events"][0],
  repoFullName: string,
): string {
  const eventTypeLabel = getEventTypeLabel(event.type);

  return `We just detected a ${eventTypeLabel} in ${repoFullName}:

📌 ${event.title}
👤 By: ${event.author}
🕐 ${formatTimestamp(event.timestamp)}

View it here: ${event.url}`;
}

function generateMultipleEventsBody(
  events: EmailNotificationJob["events"],
  repoFullName: string,
): string {
  let body = `Here's what happened in ${repoFullName}:\n\n`;

  // Group events by type
  const groupedEvents = events.reduce(
    (acc, event) => {
      const type = event.type;
      acc[type] ??= [];
      acc[type].push(event);
      return acc;
    },
    {} as Record<string, typeof events>,
  );

  // Format each group
  for (const [type, typeEvents] of Object.entries(groupedEvents)) {
    const typeLabel = getEventTypeLabel(type);
    body += `${getEventEmoji(type)} ${typeLabel.toUpperCase()} (${typeEvents.length})\n`;

    for (const event of typeEvents) {
      body += `  • ${event.title}\n`;
      body += `    By ${event.author} - ${event.url}\n\n`;
    }
  }

  return body;
}

function getEventTypeLabel(eventType: string): string {
  const typeMap: Record<string, string> = {
    new_pr: "new pull request",
    new_issue: "new issue",
    pr_merged_to_default: "merged pull request",
    new_release: "new release",
    new_fork: "new fork",
    new_branch: "new branch",
    new_contributor: "new contributor",
    stars_milestone: "stars milestone",
  };

  if (eventType.startsWith("new_issue_with_tag:")) {
    const tag = eventType.split(":")[1];
    return `new issue with "${tag}" label`;
  }

  if (eventType.startsWith("pr_merged_to_branch:")) {
    const branch = eventType.split(":")[1];
    return `PR merged to ${branch}`;
  }

  return typeMap[eventType] ?? "event";
}

function getEventEmoji(eventType: string): string {
  const emojiMap: Record<string, string> = {
    new_pr: "📬",
    new_issue: "🐛",
    pr_merged_to_default: "✅",
    new_release: "🚀",
    new_fork: "🍴",
    new_branch: "🌿",
    new_contributor: "👥",
    stars_milestone: "⭐",
  };

  if (eventType.startsWith("new_issue_with_tag:")) return "🏷️";
  if (eventType.startsWith("pr_merged_to_branch:")) return "✅";

  return emojiMap[eventType] ?? "📌";
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}
