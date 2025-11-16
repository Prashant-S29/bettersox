"use client";

import { useEffect } from "react";
import { initCacheCleanup } from "./cache";

export function CacheProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize cache cleanup on mount
    initCacheCleanup();
  }, []);

  return <>{children}</>;
}
