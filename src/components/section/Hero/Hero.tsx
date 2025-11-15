import React from "react";

// components
import { NLPSearchBar } from "~/components/feature";

export const Hero: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-5">
      <h1 className="text-lg font-semibold">
        BetterSox - Find Open Source projects in natural language
      </h1>
      <NLPSearchBar />
    </div>
  );
};
