"use client";

import React from "react";
import Link from "next/link";

import { api } from "~/trpc/react";

// libs
import { authClient } from "~/lib/auth-client";

// icons
import { PlusIcon } from "lucide-react";

// components
import { Container, SignupAlert, TrackerCard } from "~/components/common";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

const Track: React.FC = () => {
  const { data: session, isPending } = authClient.useSession();

  const {
    data: trackerData,
    isLoading,
    isRefetching,
  } = api.tracker.getTrackerMetadata.useQuery(undefined, {
    enabled: !!session?.user,
  });

  if (isLoading || isPending || isRefetching) {
    return (
      <Container className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Track a Repo</h1>
            <p className="text-muted-foreground text-sm">
              Enable tracker on a github repository to get all the updates
              directly in your inbox
            </p>
          </div>
        </div>

        <div className="bg-card flex items-center justify-between gap-9 rounded-lg border p-3">
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-3 w-full max-w-[500px]" />
            <Skeleton className="h-3 w-full max-w-[800px]" />
          </div>

          <Button variant="secondary" size="smaller" disabled>
            <PlusIcon />
            Create Tracker
          </Button>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="bg-card group flex flex-col gap-2 rounded-lg border p-3">
            <Skeleton className="h-4 w-full max-w-[100px]" />
            <Skeleton className="h-3 w-full max-w-[300px]" />
          </div>
          <div className="bg-card group flex flex-col gap-2 rounded-lg border p-3">
            <Skeleton className="h-4 w-full max-w-[100px]" />
            <Skeleton className="h-3 w-full max-w-[300px]" />
          </div>
          <div className="bg-card group flex flex-col gap-2 rounded-lg border p-3">
            <Skeleton className="h-4 w-full max-w-[100px]" />
            <Skeleton className="h-3 w-full max-w-[300px]" />
          </div>
        </div>
      </Container>
    );
  }

  if (!session?.user) {
    return (
      <Container className="flex flex-col gap-6">
        <div>
          <h1 className="text-lg font-semibold">Track a Repo</h1>
          <p className="text-muted-foreground text-sm">
            Enable tracker on a github repository to get all the updates
            directly in your inbox
          </p>
        </div>
        <SignupAlert />
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Track a Repo</h1>
          <p className="text-muted-foreground text-sm">
            Enable tracker on a github repository to get all the updates
            directly in your inbox
          </p>
        </div>
      </div>

      {trackerData?.data?.id ? (
        <div className="flex flex-col gap-5">
          <div className="bg-card flex items-center justify-between gap-9 rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">You have an active tracker</p>
              <p className="text-muted-foreground text-sm">
                You can only track one repo at a time. To create a new tracker,
                delete the existing one.
              </p>
            </div>
            <Button variant="secondary" size="smaller" disabled>
              <PlusIcon />
              Create Tracker
            </Button>
          </div>

          <div className="grid grid-cols-2">
            <TrackerCard trackerData={trackerData.data} />
          </div>
        </div>
      ) : (
        <div className="bg-card flex items-center justify-between gap-9 rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">No active tracker found</p>
            <p className="text-muted-foreground text-sm">
              Create a tracker to get started.
            </p>
          </div>
          <Button variant="secondary" size="smaller" asChild>
            <Link href="/track/new">
              <PlusIcon />
              Create Tracker
            </Link>
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Track;
