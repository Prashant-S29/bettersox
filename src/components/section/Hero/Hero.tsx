import React from "react";

// components
import { NLPSearchBar } from "~/components/feature";

export const Hero: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-5">
      <h1>BetterSox</h1>
      <NLPSearchBar />
    </div>
  );
};
