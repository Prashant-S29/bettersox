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

// types
import type { SearchFilters } from "~/types";

const MatchPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(
    null,
  );

  const {
    data: searchResults,
    isLoading: searching,
    refetch,
  } = api.search.repositories.useQuery(
    {
      filters: searchFilters!,
      perPage: 20,
    },
    {
      enabled: !!searchFilters,
    },
  );

  useEffect(() => {
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await db.getUserProfile();
      setProfile(userProfile);

      if (userProfile?.isComplete) {
        const filters = buildFiltersFromProfile(userProfile);
        setSearchFilters(filters);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const buildFiltersFromProfile = (profile: UserProfile): SearchFilters => {
    const languages = profile.skills
      .filter((s) => s.category === "programming_language")
      .map((s) => s.name);

    const frameworks = profile.skills
      .filter((s) => s.category === "framework")
      .map((s) => s.name);

    const libraries = profile.skills
      .filter((s) => s.category === "library")
      .map((s) => s.name);

    const experienceLevel =
      profile.experienceLevel === "expert"
        ? "advanced"
        : (profile.experienceLevel ?? "beginner");

    const hasGoodFirstIssues = experienceLevel === "beginner";
    const hasContributingGuide = true;
    const hasCodeOfConduct = true;
    const isWelcoming = experienceLevel === "beginner";

    let minStars = 100;
    let maxStars: number | null = null;

    if (experienceLevel === "beginner") {
      minStars = 50;
      maxStars = 5000;
    } else if (experienceLevel === "intermediate") {
      minStars = 500;
      maxStars = 20000;
    } else if (experienceLevel === "advanced") {
      minStars = 1000;
      maxStars = null;
    }

    return {
      languages: languages.slice(0, 3),
      frameworks: frameworks.slice(0, 3),
      libraries: libraries.slice(0, 2),
      experienceLevel,
      yearsOfExperience: profile.yearsOfExperience ?? null,
      projectAge: null,
      competitionLevel: experienceLevel === "beginner" ? "low" : null,
      activityLevel: "active",
      minStars,
      maxStars,
      minForks: null,
      maxForks: null,
      minContributors: null,
      maxContributors: experienceLevel === "beginner" ? 50 : null,
      hasGoodFirstIssues,
      hasHelpWanted: false,
      minOpenIssues: null,
      issueTypes: [],
      maintainerResponsiveness: "any",
      hasMentor: experienceLevel === "beginner",
      hasContributingGuide,
      hasCodeOfConduct,
      hasIssueTemplates: false,
      isWelcoming,
      topics: profile.interests,
      licenses: [],
      lastPushedWithin: "90days",
    };
  };

  const handleRefresh = async () => {
    if (profile) {
      // const filters = buildFiltersFromProfile(profile);
      // setSearchFilters(filters);
      await refetch();
      toast.info("Refreshing matches...");
    }
  };

  useEffect(() => {
    if (searchResults && searchFilters) {
      toast.success(`Found ${searchResults.totalCount} matching repositories!`);
    }
  }, [searchResults, searchFilters]);

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
            Repositories that match your skills and experience
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={searching}
            disabled={searching}
          >
            {searching ? "Searching..." : "Refresh"}
          </Button>
        </div>
      </div>

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

      {searching ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-card h-32 animate-pulse rounded-lg border"
            />
          ))}
        </div>
      ) : searchResults && searchResults.repositories.length > 0 ? (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Found {searchResults.totalCount} matching repositories
          </p>
          {searchResults.repositories.map((repo) => (
            <RepositoryCard key={repo.id} repository={repo} />
          ))}
        </div>
      ) : (
        <div className="bg-muted/30 flex flex-col items-center justify-center gap-4 rounded-lg border p-12 text-center">
          <AlertCircleIcon className="text-muted-foreground h-12 w-12" />
          <div>
            <p className="text-lg font-semibold">No matches found</p>
            <p className="text-muted-foreground text-sm">
              Try updating your profile or adjusting your preferences
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
