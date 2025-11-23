"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";

// icons
import { ChevronLeft, AlertCircleIcon } from "lucide-react";

// components
import { Container } from "~/components/common";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { EventsDataTable } from "~/components/common";
import { columns, type Event } from "~/components/common/";

const StatusPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const trackerId = params.trackerId as string;

  const { data: trackerData, isLoading: isLoadingTracker } =
    api.tracker.getTracker.useQuery();

  const { data: eventsData, isLoading: isLoadingEvents } =
    api.tracker.getEvents.useQuery({
      limit: 100,
      offset: 0,
      sortOrder: "desc",
    });

  const tracker = trackerData?.data;
  const events = (eventsData?.data?.events ?? []) as Event[];

  if (isLoadingTracker) {
    return (
      <Container className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </Container>
    );
  }

  if (tracker?.id !== trackerId) {
    return (
      <Container className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircleIcon className="text-muted-foreground h-12 w-12" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Tracker Not Found</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            This tracker doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>
        <Button onClick={() => router.push("/track")}>
          <ChevronLeft className="h-4 w-4" />
          Back to Trackers
        </Button>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-5">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => router.push(`/track/${trackerId}`)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Event History</h1>
            <p className="text-muted-foreground text-sm">
              View all detected events for {tracker.repoFullName}
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6">
        {isLoadingEvents ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <EventsDataTable
            columns={columns}
            data={events}
            trackedEvents={tracker.trackedEvents}
          />
        )}
      </Card>
    </Container>
  );
};

export default StatusPage;
