"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";

// components
import { Container } from "~/components/common";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";
import { EventsDataTable } from "~/components/common";
import { columns, type Event } from "~/components/common";

// icons
import {
  GitBranchIcon,
  PlayIcon,
  PauseIcon,
  Trash2Icon,
  ActivityIcon,
  SparklesIcon,
  SettingsIcon,
  BarChart3Icon,
  ChevronLeft,
  RefreshCwIcon,
} from "lucide-react";

const TrackerDashboard: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const trackerId = params.trackerId as string;
  const utils = api.useUtils();

  const {
    data: trackerData,
    isLoading: isLoadingTracker,
    refetch: refetchTracker,
    isFetching: isFetchingTracker,
  } = api.tracker.getTracker.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    refetch: refetchEvents,
    isFetching: isFetchingEvents,
  } = api.tracker.getEvents.useQuery({
    limit: 10,
    offset: 0,
    sortOrder: "desc",
  });

  const pauseMutation = api.tracker.pause.useMutation({
    onSuccess: () => {
      toast.success("Tracker paused");
      void utils.tracker.getTracker.invalidate();
      void utils.tracker.getTrackerMetadata.invalidate();
    },
    onError: () => {
      toast.error("Failed to pause tracker");
    },
  });

  const resumeMutation = api.tracker.resume.useMutation({
    onSuccess: () => {
      toast.success("Tracker resumed");
      void utils.tracker.getTracker.invalidate();
      void utils.tracker.getTrackerMetadata.invalidate();
    },
    onError: () => {
      toast.error("Failed to resume tracker");
    },
  });

  const deleteMutation = api.tracker.delete.useMutation({
    onSuccess: () => {
      toast.success("Tracker deleted successfully");
      void utils.tracker.getTracker.invalidate();
      void utils.tracker.getTrackerMetadata.invalidate();
      router.push("/track");
    },
    onError: () => {
      toast.error("Failed to delete tracker");
    },
  });

  const tracker = trackerData?.data;
  const events = (eventsData?.data?.events ?? []) as Event[];

  const handleRefresh = async () => {
    await Promise.all([refetchTracker(), refetchEvents()]);
    toast.success("Data refreshed");
  };

  if (isLoadingTracker) {
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
              <h1 className="text-lg font-semibold">Tracker Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                Monitor and manage your repository tracker
              </p>
            </div>
          </div>
        </div>

        <Card className="gap-5 p-0">
          <div className="flex items-start justify-between px-5 pt-5">
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranchIcon className="text-muted-foreground h-4 w-4" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-5 w-[100px]" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-3 w-[80px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3 px-5">
            <h3 className="text-sm font-medium">Currently Tracking:</h3>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-2 px-5 pb-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-[80px]" />
              <Skeleton className="h-7 w-[80px]" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-[80px]" />
              <Skeleton className="h-7 w-[80px]" />
            </div>
          </div>
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
              <h1 className="text-lg font-semibold">Tracker Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                Monitor and manage your repository tracker
              </p>
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

  const isPaused = tracker.isPaused;
  const isActive = tracker.isActive;
  const isRefreshing = isFetchingTracker || isFetchingEvents;

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
            <h1 className="text-lg font-semibold">Tracker Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Monitor and manage your repository tracker
            </p>
          </div>
        </div>
      </div>

      <Card className="gap-5 p-0">
        <div className="flex items-start justify-between px-5 pt-5">
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranchIcon className="text-muted-foreground h-4 w-4" />
                <h2 className="font-semibold">{tracker.repoFullName}</h2>
              </div>

              <Badge
                variant={
                  isPaused ? "secondary" : isActive ? "outline" : "destructive"
                }
                className="gap-2"
              >
                <span
                  className={`size-2 rounded-full ${isPaused ? "bg-primary" : isActive ? "animate-pulse bg-green-500" : "bg-destructive"}`}
                />
                {isPaused ? "Paused" : isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1 px-3 py-1">
                <ActivityIcon className="h-3 w-3" />
                Tracking {tracker.trackedEvents.length} events
              </Badge>

              {tracker.enableAiSummary && (
                <Badge variant="outline" className="gap-1 px-3 py-1">
                  <SparklesIcon className="h-3 w-3" />
                  AI Summaries enabled
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-3 px-5">
          <h3 className="text-sm font-medium">Currently Tracking:</h3>
          <div className="flex flex-wrap gap-2">
            {tracker.trackedEvents.map((event) => (
              <Badge key={event} variant="secondary">
                {event.replace(/_/g, " ").replace(/:/g, " → ")}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-2 px-5 pb-5">
          <div className="flex items-center gap-3">
            <Button size="smaller" variant="outline" asChild>
              <Link href={`/track/${trackerId}/manage`}>
                <SettingsIcon className="h-4 w-4" />
                Manage Settings
              </Link>
            </Button>

            <Button size="smaller" variant="outline" asChild>
              <Link href={`/track/${trackerId}/status`}>
                <BarChart3Icon className="h-4 w-4" />
                View All Events
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {isPaused ? (
              <Button
                size="smaller"
                onClick={() => resumeMutation.mutate()}
                disabled={resumeMutation.isPending}
              >
                <PlayIcon className="h-4 w-4" />
                Resume Tracking
              </Button>
            ) : (
              <Button
                size="smaller"
                variant="secondary"
                onClick={() => pauseMutation.mutate()}
                disabled={pauseMutation.isPending}
              >
                <PauseIcon className="h-4 w-4" />
                Pause Tracking
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="smaller"
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2Icon className="h-4 w-4" />
                  Delete Tracker
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Tracker?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this tracker? This action
                    cannot be undone. All event logs will be permanently
                    deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Button
            variant="outline"
            size="smaller"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCwIcon
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <EventsDataTable
          columns={columns}
          data={events}
          trackedEvents={tracker.trackedEvents}
          isRecentView={true}
          isLoading={isLoadingEvents}
        />
      </Card>
    </Container>
  );
};

export default TrackerDashboard;
