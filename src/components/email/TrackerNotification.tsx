import { Text, Section, Link } from "@react-email/components";
import { EmailLayout } from "./Layout";

interface Event {
  id: string;
  type: string;
  title: string;
  url: string;
  author: string;
  timestamp: string;
}

interface TrackerNotificationEmailProps {
  userName: string;
  repoFullName: string;
  events: Event[];
  trackerId: string;
}

export const TrackerNotificationEmail: React.FC<
  TrackerNotificationEmailProps
> = ({ userName, repoFullName, events, trackerId }) => {
  const isSingleEvent = events.length === 1;
  const event = events[0];

  return (
    <EmailLayout
      previewText={
        isSingleEvent
          ? `${getEventTypeLabel(event!.type)} in ${repoFullName}`
          : `${events.length} new events in ${repoFullName}`
      }
      trackerId={trackerId}
    >
      <Text className="text-base text-[#ffffff]">
        <span className="text-[#808080]">Hey {userName},</span> we have updates
        on {repoFullName}
      </Text>

      {isSingleEvent ? (
        <>
          <Section className="mb-6">
            <Text className="m-0 text-base text-[#FFFFFF]">
              {getEventTypeLabel(event!.type)}
            </Text>
            <Section className="pl-2">
              <Link
                href={event!.url}
                className="mt-2 block text-[15px] text-[#808080] underline underline-offset-2"
              >
                {event!.title} by {event!.author}
              </Link>
            </Section>
          </Section>
        </>
      ) : (
        <>{renderGroupedEvents(events)}</>
      )}
    </EmailLayout>
  );
};

function renderGroupedEvents(events: Event[]) {
  const grouped = events.reduce(
    (acc, event) => {
      acc[event.type] ??= [];
      acc[event.type]!.push(event);
      return acc;
    },
    {} as Record<string, Event[]>,
  );

  return (
    <Section>
      {Object.entries(grouped).map(([type, typeEvents]) => (
        <Section key={type} className="mb-6">
          <Text className="m-0 text-base text-[#FFFFFF]">
            {getEventTypeLabel(type)} ({typeEvents.length})
          </Text>
          {typeEvents.map((event) => (
            <Section key={event.id} className="pl-2">
              <Link
                href={event.url}
                className="mt-2 block text-[15px] text-[#808080] underline underline-offset-2"
              >
                {event.title} by {event.author}
              </Link>
            </Section>
          ))}
        </Section>
      ))}
    </Section>
  );
}

function getEventTypeLabel(eventType: string): string {
  const typeMap: Record<string, string> = {
    new_pr: "New Pull Request",
    new_issue: "New Issue",
    pr_merged_to_default: "Merged Pull Request",
    new_release: "New Release",
    new_fork: "New Fork",
    new_branch: "New Branch",
    new_contributor: "New Contributor",
  };

  if (eventType.startsWith("new_issue_with_tag:")) {
    const tag = eventType.split(":")[1];
    return `New Issue with "${tag}" label`;
  }

  if (eventType.startsWith("pr_merged_to_branch:")) {
    const branch = eventType.split(":")[1];
    return `PR merged to ${branch}`;
  }

  return typeMap[eventType] ?? "event";
}
