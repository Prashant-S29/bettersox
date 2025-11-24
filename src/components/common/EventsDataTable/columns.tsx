"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import {
  ExternalLinkIcon,
  ArrowUpDown,
  GitPullRequestArrow,
  CircleDot,
  UserRound,
  GitFork,
  Rocket,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export type Event = {
  id: string;
  trackedRepoId: string;
  eventType: string;
  eventData: {
    type: string;
    title: string;
    url: string;
    author: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  };
  eventSignature: string;
  detectedAt: Date;
  notifiedAt: Date | null;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const getEventIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    new_pr: <GitPullRequestArrow size={18} />,
    pr_merged_to_default: <GitPullRequestArrow size={18} />,
    pr_merged_to_branch: <GitPullRequestArrow size={18} />,
    new_issue: <CircleDot size={18} />,
    new_issue_with_tag: <CircleDot size={18} />,
    new_issue_with_custom_tag: <CircleDot size={18} />,
    new_contributor: <UserRound size={18} />,
    new_fork: <GitFork size={18} />,
    new_release: <Rocket size={18} />,
  };
  return icons[type] ?? <CircleDot size={18} />;
};

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "eventType",
    header: "",
    cell: ({ row }) => {
      const type = row.getValue("eventType");
      return (
        <div className="text-muted-foreground flex justify-center">
          {getEventIcon(type as string)}
        </div>
      );
    },
    enableSorting: false,
    filterFn: (row, id, value) => {
      return value === "" || row.getValue(id) === value;
    },
  },
  {
    accessorKey: "title",
    header: "Event",
    cell: ({ row }) => {
      const eventData = row.original.eventData;
      return <p className="font-medium text-wrap">{eventData.title}</p>;
    },
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => {
      const author = row.original.eventData.author;
      return <p className="text-sm">{author}</p>;
    },
  },
  {
    accessorKey: "detectedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto bg-transparent! p-0!"
        >
          Detected
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("detectedAt");
      return (
        <p className="text-muted-foreground text-sm">
          {formatDistanceToNow(new Date(date as string), { addSuffix: true })}
        </p>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const url = row.original.eventData.url;
      return (
        <Button size="icon-sm" variant="ghost" asChild>
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];
