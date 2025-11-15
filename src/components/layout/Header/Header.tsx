"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon, HomeIcon, SearchIcon, SettingsIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

export const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">BetterSOX</span>
          </Link>
        </div>

        <nav className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              asChild
              variant={pathname === "/" ? "default" : "ghost"}
              size="sm"
            >
              <Link href="/">
                <HomeIcon className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>

            <Button
              asChild
              variant={pathname === "/search" ? "default" : "ghost"}
              size="sm"
            >
              <Link href="/search">
                <SearchIcon className="mr-2 h-4 w-4" />
                Search
              </Link>
            </Button>

            <Button
              asChild
              variant={pathname === "/bookmarks" ? "default" : "ghost"}
              size="sm"
            >
              <Link href="/bookmarks">
                <BookmarkIcon className="mr-2 h-4 w-4" />
                Bookmarks
              </Link>
            </Button>
          </div>

          <Button
            asChild
            variant={pathname === "/settings" ? "default" : "ghost"}
            size="icon-sm"
          >
            <Link href="/settings">
              <SettingsIcon className="h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
