"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";

// icons
import { ChevronLeft } from "lucide-react";

// components
import { Container } from "~/components/common";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { EventsDataTable } from "~/components/common";
import { columns, type Event } from "~/components/common/";
import Link from "next/link";

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
        <div className="flex flex-col gap-5">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => router.push("/track")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Event History</h1>

            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-sm whitespace-nowrap">
                View all detected events for
              </p>
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
        </div>

        <Card className="p-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="mt-4 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </Card>
      </Container>
    );
  }

  if (!tracker?.id || trackerId !== tracker?.id) {
    return (
      <Container className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-5">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => router.push("/track")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Event History</h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground text-sm whitespace-nowrap">
                  View all detected events for
                </p>
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card flex items-center justify-between gap-9 rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Tracker not found</p>
            <p className="text-muted-foreground text-sm">
              This tracker doesn&apos;t exist or you don&apos;t have access to
              it.
            </p>
          </div>
          <Button variant="secondary" size="smaller" asChild>
            <Link href="/track/new">
              <ChevronLeft />
              Back
            </Link>
          </Button>
        </div>
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
        <EventsDataTable
          columns={columns}
          data={events}
          trackedEvents={tracker.trackedEvents}
          isLoading={isLoadingEvents}
        />
      </Card>
    </Container>
  );
};

export default StatusPage;
