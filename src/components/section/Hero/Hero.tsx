import React from "react";
import { Container } from "~/components/common";

// components
import { NLPSearchBar } from "~/components/feature";

export const Hero: React.FC = () => {
  return (
    <Container className="relative flex h-screen w-full flex-col items-center justify-center gap-5">
      <div className="flex flex-col gap-1 text-center">
        <p className="font-flagfies text-4xl">Welcome to BetterSox</p>
        <p className="text-muted-foreground">
          Open source search engine for open source projects. Free Forever. No
          signup required.
        </p>
      </div>
      <NLPSearchBar />

      <div className="absolute bottom-0 left-0 z-10 w-full px-2 py-3">
        <p className="text-muted-foreground text-center text-sm">
          BetterSox is a free forever and fully open source search engine for
          open source projects. No need to pay $49 per year on the name of
          mentorship and gsoc.
        </p>
      </div>
    </Container>
  );
};
