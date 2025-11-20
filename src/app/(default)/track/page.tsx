import React from "react";
import { headers } from "next/headers";

// components
import { Container, SignupAlert } from "~/components/common";

// libs
import { auth } from "~/lib/auth";

const Track: React.FC = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session.id) {
    return (
      <Container className="flex flex-col gap-6">
        <div>
          <h1 className="text-lg font-semibold">Track a Repo</h1>
          <p className="text-muted-foreground text-sm">
            Enable tracker on a GitHub repository to get all the updates
            directly in your inbox.
          </p>
        </div>
        <SignupAlert />
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Track a Repo</h1>
        <p className="text-muted-foreground text-sm">
          Enable tracker on a GitHub repository to get all the updates directly
          in your inbox.
        </p>
      </div>
      <p>
        you are logged in as
        {session?.user.email}
      </p>
    </Container>
  );
};

export default Track;
