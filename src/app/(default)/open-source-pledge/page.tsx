"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// icons
import { Loader2Icon } from "lucide-react";

// libs
import { db, type PledgeStatus } from "~/lib/storage";

// components
import { Button } from "~/components/ui/button";
import { Container } from "~/components/common";
import { toast } from "sonner";

const OpenSourcePledgePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [loading, setLoading] = useState(true);
  const [pledgeStatus, setPledgeStatus] = useState<PledgeStatus | null>(null);
  const [name, setName] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    void loadPledgeStatus();
  }, []);

  const loadPledgeStatus = async () => {
    try {
      setLoading(true);
      const status = await db.getPledgeStatus();
      if (status) {
        setPledgeStatus(status);
        setName(status.name);
      }
    } catch (error) {
      console.error("Error loading pledge status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters long");
      return;
    }

    try {
      setSigning(true);
      const pledge: PledgeStatus = {
        id: "pledge",
        name: name.trim(),
        signed: true,
        signedAt: Date.now(),
      };

      await db.setPledgeStatus(pledge);
      setPledgeStatus(pledge);
      toast.success("Pledge signed successfully!");

      // Redirect to the original page or home
      setTimeout(() => {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push("/");
        }
      }, 1000);
    } catch (error) {
      console.error("Error signing pledge:", error);
      toast.error("Failed to sign pledge");
    } finally {
      setSigning(false);
    }
  };

  const handleNavigate = () => {
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <Container className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="text-primary h-8 w-8 animate-spin" />
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Open Source Pledge</h1>
        <p className="text-muted-foreground text-sm">
          Please read and sign this pledge before using BetterSox
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p>
          Why not to contribute to open source?
          <br />
          <span className="text-muted-foreground">
            I have watched&nbsp;
            <Link
              href="https://www.youtube.com/watch?v=5nY_cy8zcO4"
              target="_blank"
              className="underline underline-offset-2"
            >
              this
            </Link>
            &nbsp;video and fully understood why not to contribute to open
            source.
          </span>
        </p>

        <p>
          Respect for Fellow Developers
          <br />
          <span className="text-muted-foreground">
            I will never look down on another developer&apos;s work and will
            always maintain a respectful and supportive attitude.
          </span>
        </p>

        <p>
          No Spam or Unethical Contributions
          <br />
          <span className="text-muted-foreground">
            I will never create spam pull requests or misuse events like
            Hacktoberfest for invalid or low-quality contributions.
          </span>
        </p>

        <p>
          Encouraging Open Source Participation
          <br />
          <span className="text-muted-foreground">
            I will motivate and encourage others to participate meaningfully in
            open source.
          </span>
        </p>

        <p>
          Supporting Projects I Use
          <br />
          <span className="text-muted-foreground">
            I will support the open-source projects I use through sponsorships
            or by spreading kind words to appreciate maintainers.
          </span>
        </p>
      </div>
      {pledgeStatus?.signed ? (
        <div className="flex items-center justify-between rounded-lg border px-5 py-4">
          <p className="text-muted-foreground">
            Great <span className="text-primary">{pledgeStatus.name}</span>, you
            have signed your open-source pledge.
          </p>

          <Button onClick={handleNavigate} size="smaller" variant="outline">
            {redirectTo ? "Continue" : "New Search"}
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border px-5 py-4">
          I{" "}
          <input
            className="text-muted-foreground border-b px-2 focus:outline-none"
            placeholder="full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={signing}
          />
          , hereby declare that I have read and fully understood the Open Source
          Pledge. I agree to abide by all the principles stated above.
          <div className="mt-4 flex justify-end gap-3">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              disabled={signing}
              size="smaller"
            >
              Cancel
            </Button>
            <Button onClick={handleSign} disabled={signing} size="smaller">
              {signing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                "Agree and Sign"
              )}
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default OpenSourcePledgePage;
