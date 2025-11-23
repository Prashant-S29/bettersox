import React from "react";
import Link from "next/link";

// components
import { Badge } from "~/components/ui/badge";

// libs
import { formatDate } from "~/lib/utils/date-parser";

interface TrackerCardProps {
  trackerData: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    repoOwner: string;
    repoName: string;
    repoFullName: string;
    repoUrl: string;
    isActive: boolean;
    isPaused: boolean;
    errorCount: number;
  };
}

export const TrackerCard: React.FC<TrackerCardProps> = ({ trackerData }) => {
  const isPaused = trackerData.isPaused;
  const isActive = trackerData.isActive;
  return (
    <div className="bg-card group flex flex-col gap-1 rounded-lg border p-3">
      <div className="flex w-full items-center justify-between">
        <Link
          href={`/track/${trackerData.id}`}
          className="font-semibold underline-offset-2 group-hover:underline"
        >
          {trackerData.repoFullName}
        </Link>

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

      <div className="text-muted-foreground text-sm">
        <p>Created at: {formatDate(trackerData.createdAt.toString())}</p>
      </div>
    </div>
  );
};
