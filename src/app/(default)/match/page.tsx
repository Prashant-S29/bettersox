"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// icons
import { Loader2Icon, AlertCircleIcon } from "lucide-react";

// components
import { Container } from "~/components/common";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { RepositoryCard } from "~/components/feature";

// libs
import { db, type UserProfile } from "~/lib/storage";
import { api } from "~/trpc/react";

const MatchPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Use the match endpoint instead of search
  const { data: matchResults, isLoading: searching } =
    api.match.findMatches.useQuery(
      {
        skills: profile?.skills ?? [],
        experienceLevel: profile?.experienceLevel ?? "beginner",
        interests: profile?.interests ?? [],
        yearsOfExperience: profile?.yearsOfExperience ?? null,
      },
      {
        enabled: !!profile && profile.isComplete,
      },
    );

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await db.getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Show success toast when matches are found
  useEffect(() => {
    if (matchResults && matchResults.totalCount > 0) {
      toast.success(matchResults.message);
    }
  }, [matchResults]);

  if (loading) {
    return (
      <Container className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="text-primary h-8 w-8 animate-spin" />
      </Container>
    );
  }

  // no profile
  if (!profile?.isComplete) {
    return (
      <Container className="flex flex-col gap-6">
        <div>
          <h1 className="text-lg font-semibold">Find Your Match</h1>
          <p className="text-muted-foreground text-sm">
            Find the best matching repositories for your skills and experience.
          </p>
        </div>

        <div className="bg-card flex items-center justify-between gap-9 rounded-lg border p-6">
          <div>
            <p className="font-medium">Complete your profile</p>
            <p className="text-muted-foreground text-sm">
              Complete your profile to find the best repositories for you.
            </p>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/profile">Check Profile</Link>
          </Button>
        </div>
      </Container>
    );
  }

  // show matches
  return (
    <Container className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Your Matches</h1>
          <p className="text-muted-foreground text-sm">
            Repositories ranked by relevance to your profile
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/profile")}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{profile.fullName}</h2>
            {profile.headline && (
              <p className="text-muted-foreground text-sm">
                {profile.headline}
              </p>
            )}
          </div>
          <Badge variant="secondary">{profile.experienceLevel}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.skills.slice(0, 10).map((skill) => (
            <Badge key={skill.name} variant="outline">
              {skill.name}
            </Badge>
          ))}
          {profile.skills.length > 10 && (
            <Badge variant="outline">+{profile.skills.length - 10} more</Badge>
          )}
        </div>

        {profile.resumeFileName && (
          <p className="text-muted-foreground mt-4 text-xs">
            Reading data from{" "}
            <span className="font-medium">{profile.resumeFileName}</span>
          </p>
        )}
      </div>

      {/* Matches */}
      {searching ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-card h-32 animate-pulse rounded-lg border"
            />
          ))}
        </div>
      ) : matchResults && matchResults.repositories.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {matchResults.totalCount} repositories matched (showing top 50)
            </p>
          </div>
          {matchResults.repositories.map((repo) => (
            <div key={repo.id} className="space-y-2">
              <RepositoryCard repository={repo} hideMissingFilters />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-muted/30 flex flex-col items-center justify-center gap-4 rounded-lg border p-12 text-center">
          <AlertCircleIcon className="text-muted-foreground h-12 w-12" />
          <div>
            <p className="text-lg font-semibold">No matches found</p>
            <p className="text-muted-foreground text-sm">
              Try updating your profile with more skills
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/profile")}>
            Edit Profile
          </Button>
        </div>
      )}
    </Container>
  );
};

export default MatchPage;
