import React from "react";

// components
import { SearchHistory, FilterPresets } from "~/components/feature";
import { Hero } from "~/components/section";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 py-16">
      <Hero />

      <div className="container flex flex-col items-center gap-12">
        <FilterPresets />
        <SearchHistory />
      </div>
    </main>
  );
}
