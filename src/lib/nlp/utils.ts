import type { SearchFilters } from "~/types";

export function filtersToSearchParams(
  filters: Partial<SearchFilters>,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.languages && filters.languages.length > 0) {
    params.set("languages", filters.languages.join(","));
  }
  if (filters.frameworks && filters.frameworks.length > 0) {
    params.set("frameworks", filters.frameworks.join(","));
  }
  if (filters.libraries && filters.libraries.length > 0) {
    params.set("libraries", filters.libraries.join(","));
  }
  if (filters.topics && filters.topics.length > 0) {
    params.set("topics", filters.topics.join(","));
  }

  if (filters.experienceLevel) {
    params.set("experience", filters.experienceLevel);
  }
  if (filters.yearsOfExperience) {
    params.set("yearsExp", filters.yearsOfExperience.toString());
  }
  if (filters.projectAge) {
    params.set("projectAge", filters.projectAge);
  }
  if (filters.competitionLevel) {
    params.set("competition", filters.competitionLevel);
  }
  if (filters.activityLevel) {
    params.set("activity", filters.activityLevel);
  }

  if (filters.minStars) {
    params.set("minStars", filters.minStars.toString());
  }
  if (filters.maxStars) {
    params.set("maxStars", filters.maxStars.toString());
  }
  if (filters.minForks) {
    params.set("minForks", filters.minForks.toString());
  }
  if (filters.maxForks) {
    params.set("maxForks", filters.maxForks.toString());
  }
  if (filters.minContributors) {
    params.set("minContributors", filters.minContributors.toString());
  }
  if (filters.maxContributors) {
    params.set("maxContributors", filters.maxContributors.toString());
  }
  if (filters.minOpenIssues) {
    params.set("minOpenIssues", filters.minOpenIssues.toString());
  }

  if (filters.hasGoodFirstIssues) {
    params.set("goodFirstIssues", "true");
  }
  if (filters.hasHelpWanted) {
    params.set("helpWanted", "true");
  }
  if (filters.hasMentor) {
    params.set("hasMentor", "true");
  }
  if (filters.hasContributingGuide) {
    params.set("hasContributing", "true");
  }
  if (filters.hasCodeOfConduct) {
    params.set("hasCodeOfConduct", "true");
  }
  if (filters.hasIssueTemplates) {
    params.set("hasIssueTemplates", "true");
  }

  if (filters.lastPushedWithin) {
    params.set("lastPushed", filters.lastPushedWithin);
  }

  if (
    filters.maintainerResponsiveness &&
    filters.maintainerResponsiveness !== "any"
  ) {
    params.set("responsiveness", filters.maintainerResponsiveness);
  }

  return params;
}

export function searchParamsToFilters(
  params: URLSearchParams,
): Partial<SearchFilters> {
  const filters: Partial<SearchFilters> = {
    languages: [],
    frameworks: [],
    libraries: [],
    topics: [],
  };

  const languages = params.get("languages");
  if (languages) {
    filters.languages = languages.split(",").filter(Boolean);
  }

  const frameworks = params.get("frameworks");
  if (frameworks) {
    filters.frameworks = frameworks.split(",").filter(Boolean);
  }

  const libraries = params.get("libraries");
  if (libraries) {
    filters.libraries = libraries.split(",").filter(Boolean);
  }

  const topics = params.get("topics");
  if (topics) {
    filters.topics = topics.split(",").filter(Boolean);
  }

  const experience = params.get("experience");
  if (
    experience === "beginner" ||
    experience === "intermediate" ||
    experience === "advanced"
  ) {
    filters.experienceLevel = experience;
  }

  const yearsExp = params.get("yearsExp");
  if (yearsExp) {
    filters.yearsOfExperience = parseInt(yearsExp);
  }

  const projectAge = params.get("projectAge");
  if (
    projectAge === "very_new" ||
    projectAge === "new" ||
    projectAge === "established" ||
    projectAge === "mature"
  ) {
    filters.projectAge = projectAge;
  }

  const competition = params.get("competition");
  if (
    competition === "low" ||
    competition === "medium" ||
    competition === "high"
  ) {
    filters.competitionLevel = competition;
  }

  const activity = params.get("activity");
  if (
    activity === "very_active" ||
    activity === "active" ||
    activity === "moderate" ||
    activity === "inactive"
  ) {
    filters.activityLevel = activity;
  }

  const minStars = params.get("minStars");
  if (minStars) filters.minStars = parseInt(minStars);

  const maxStars = params.get("maxStars");
  if (maxStars) filters.maxStars = parseInt(maxStars);

  const minForks = params.get("minForks");
  if (minForks) filters.minForks = parseInt(minForks);

  const maxForks = params.get("maxForks");
  if (maxForks) filters.maxForks = parseInt(maxForks);

  const minContributors = params.get("minContributors");
  if (minContributors) filters.minContributors = parseInt(minContributors);

  const maxContributors = params.get("maxContributors");
  if (maxContributors) filters.maxContributors = parseInt(maxContributors);

  const minOpenIssues = params.get("minOpenIssues");
  if (minOpenIssues) filters.minOpenIssues = parseInt(minOpenIssues);

  filters.hasGoodFirstIssues = params.get("goodFirstIssues") === "true";
  filters.hasHelpWanted = params.get("helpWanted") === "true";
  filters.hasMentor = params.get("hasMentor") === "true";
  filters.hasContributingGuide = params.get("hasContributing") === "true";
  filters.hasCodeOfConduct = params.get("hasCodeOfConduct") === "true";
  filters.hasIssueTemplates = params.get("hasIssueTemplates") === "true";

  const lastPushed = params.get("lastPushed");
  if (
    lastPushed === "7days" ||
    lastPushed === "30days" ||
    lastPushed === "90days"
  ) {
    filters.lastPushedWithin = lastPushed;
  }

  const responsiveness = params.get("responsiveness");
  if (
    responsiveness === "high" ||
    responsiveness === "medium" ||
    responsiveness === "low"
  ) {
    filters.maintainerResponsiveness = responsiveness;
  } else {
    filters.maintainerResponsiveness = "any";
  }

  return filters;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    language: "Language",
    framework: "Framework",
    library: "Library",
    experience: "Experience",
    projectAge: "Project Age",
    competition: "Competition",
    activity: "Activity",
    issue: "Issues",
    community: "Community",
    topic: "Topic",
    time: "Time",
    metrics: "Metrics",
    maintainer: "Maintainer",
  };

  return labels[category] ?? category;
}

export function getCategoryColor(category: string): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    language: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    framework: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    library: {
      bg: "bg-pink-50",
      text: "text-pink-700",
      border: "border-pink-200",
    },
    experience: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    projectAge: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    competition: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
    },
    activity: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
    },
    issue: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
    community: {
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      border: "border-cyan-200",
    },
    topic: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
    },
    time: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    metrics: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
    },
  };

  return (
    colors[category] ?? {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
    }
  );
}
