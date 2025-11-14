"use client";

import { ThemeProvider } from "next-themes";
import { useMount } from "~/hooks";
import { TRPCReactProvider } from "~/trpc/react";

export const Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isMounted = useMount();

  if (!isMounted) {
    return null;
  }

  return (
    <TRPCReactProvider>
      <ThemeProvider defaultTheme="dark" forcedTheme="dark" attribute="class">
        {children}
      </ThemeProvider>
    </TRPCReactProvider>
  );
};
