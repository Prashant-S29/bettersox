import Link from "next/link";
import React from "react";
import { Container } from "~/components/common";

const StagingPage: React.FC = () => {
  return (
    <Container className="relative flex h-screen w-full flex-col items-center justify-center gap-5">
      <div className="flex flex-col items-center justify-center gap-1 text-center">
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
        <p className="font-flagfies mt-1 text-4xl">Welcome to BetterSox</p>
        <p className="text-muted-foreground">
          Open source search engine for open source projects. Free Forever.
        </p>
        <p className="text-muted-foreground mx-auto mt-5 rounded-xl border p-3">
          This is a staging environment for testing new features. <br /> Please
          visit{" "}
          <Link
            href="https://bettersox.vercel.app/"
            target="_blank"
            className="underline underline-offset-2"
          >
            BetterSox
          </Link>{" "}
          for the official version.
        </p>
      </div>
    </Container>
  );
};

export default StagingPage;
