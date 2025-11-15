"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowUpDownIcon } from "lucide-react";

export type SortOption = "stars" | "forks" | "updated" | "created";

interface SortOptionsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export const SortOptions: React.FC<SortOptionsProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDownIcon className="text-muted-foreground h-4 w-4" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="stars">Most Stars</SelectItem>
          <SelectItem value="forks">Most Forks</SelectItem>
          <SelectItem value="updated">Recently Updated</SelectItem>
          <SelectItem value="created">Recently Created</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
