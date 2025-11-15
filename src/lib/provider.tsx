"use client";

import { ThemeProvider } from "next-themes";
import { useMount } from "~/hooks";
import { TRPCReactProvider } from "~/trpc/react";
import { CacheProvider } from "./storage/CacheProvider";
import { SidebarProvider } from "~/components/ui/sidebar";
import { SearchHistoryProvider } from "~/contexts";

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isMounted = useMount();

  if (!isMounted) {
    return null;
  }

  return (
    <TRPCReactProvider>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <CacheProvider>
          <SearchHistoryProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </SearchHistoryProvider>
        </CacheProvider>
      </ThemeProvider>
    </TRPCReactProvider>
  );
};
