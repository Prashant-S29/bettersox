"use client";

import { ThemeProvider } from "next-themes";
import { useMount } from "~/hooks";
import { TRPCReactProvider } from "~/trpc/react";
import { CacheProvider } from "./storage/CacheProvider";
import { SidebarProvider } from "~/components/ui/sidebar";
import { SearchHistoryProvider } from "~/contexts";
import { useIsMobile } from "~/hooks/use-mobile";

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isMounted = useMount();
  const isMobile = useIsMobile();

  if (!isMounted) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-5">
        <div className="flex flex-col items-center gap-1 text-center">
          <svg
            width="60"
            height="20"
            viewBox="0 0 200 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="50" fill="var(--primary)" />
            <path
              d="M100 0C113.261 0 125.979 5.26784 135.355 14.6447C144.732 24.0215 150 36.7392 150 50C150 63.2608 144.732 75.9785 135.355 85.3553C125.979 94.7322 113.261 100 100 100L100 50L100 0Z"
              fill="var(--primary)"
            />
            <path
              d="M150 0C163.261 0 175.979 5.26784 185.355 14.6447C194.732 24.0215 200 36.7392 200 50C200 63.2608 194.732 75.9785 185.355 85.3553C175.979 94.7322 163.261 100 150 100L150 50V0Z"
              fill="var(--primary)"
            />
          </svg>
          <p className="font-flagfies mt-2 text-2xl md:text-4xl">
            Welcome to BetterSox
          </p>
          <p className="text-muted-foreground text-sm md:text-base">
            Open source search engine for open source projects. Free Forever. No
            signup required.
          </p>
        </div>
        <p className="text-muted-foreground bg-card mt-5 rounded-full border px-4 py-2 text-center text-sm">
          Use a desktop device for better experience.
        </p>
      </div>
    );
  }

  return (
    <TRPCReactProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
      >
        <CacheProvider>
          <SearchHistoryProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </SearchHistoryProvider>
        </CacheProvider>
      </ThemeProvider>
    </TRPCReactProvider>
  );
};
