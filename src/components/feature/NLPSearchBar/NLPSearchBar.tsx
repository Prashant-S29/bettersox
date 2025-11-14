"use client";

import React from "react";

// icons
import { ArrowUpIcon } from "lucide-react";

// components
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "~/components/ui/input-group";

export const NLPSearchBar: React.FC = () => {
  return (
    <InputGroup className="w-[500px]">
      <InputGroupTextarea placeholder="I am looking for a open source project..." />
      <InputGroupAddon align="block-end" className="flex justify-end">
        <InputGroupButton
          variant="default"
          className="rounded-full"
          size="icon-xs"
        >
          <ArrowUpIcon />
          <span className="sr-only">Send</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};
