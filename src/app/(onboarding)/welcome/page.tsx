import React from "react";
import Link from "next/link";

// components
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

interface WelcomeProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

const Welcome: React.FC<WelcomeProps> = async ({ searchParams }) => {
  const { redirectTo } = await searchParams;

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-5">
      <div className="bg-card flex w-full max-w-2xl flex-col gap-4 rounded-lg border">
        <div className="gap-1/2 flex flex-col items-center justify-center px-4 pt-6 text-center">
          <svg
            width="80"
            height="30"
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
          <h1 className="font-flagfies mt-3 text-3xl font-medium">
            Welcome to BetterSox
          </h1>
          <p className="text-muted-foreground">
            An open source search engine to find open source projects. Free and{" "}
            <Link
              href="https://github.com/Prashant-S29/bettersox"
              className="underline underline-offset-2"
              target="_blank"
            >
              Open Source
            </Link>
          </p>
        </div>
        <Separator />
        <div className="flex flex-col gap-3 px-4">
          <div>
            <h3 className="font-medium">Our Vision</h3>
            <p className="text-muted-foreground text-sm">
              With BetterSox, we aim to reduce the initial friction for new
              developers to contribute to open source projects. We want to make
              it easy for developers to find projects that align with their
              interests and skills.
            </p>
          </div>
          <div>
            <h3 className="font-medium">What is BetterSox?</h3>
            <p className="text-muted-foreground text-sm">
              We are a search engine that helps you find open source projects
              based on your interests and skills. Our goal is to be a
              centralized platform that helps developers to start contributing
              to open source projects.
            </p>
          </div>
          <div>
            <h3 className="font-medium">What we are not? VERY IMPORTANT</h3>
            <p className="text-muted-foreground text-sm">
              We are not a platform where you will find mentorship to help you
              get started. We DO NOT provide any sort of mentorship and promote
              events like gsoc or hacktoberfest.
            </p>
          </div>
        </div>
        <Separator />

        <div className="flex justify-end gap-3 px-4 pb-4">
          <Button variant="outline" size="smaller" className="h-7.5" asChild>
            <Link
              href="https://github.com/Prashant-S29/bettersox"
              target="_blank"
              className="h-7.5"
            >
              Give us a Star
            </Link>
          </Button>
          <Button variant="default" size="smaller" asChild>
            <Link href={redirectTo ?? "/"}>Continue my Journey</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
