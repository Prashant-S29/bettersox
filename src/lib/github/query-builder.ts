import type { SearchFilters } from "~/types";

export function buildGitHubSearchQuery(filters: Partial<SearchFilters>): string {
  const queryParts: string[] = [];

  // Languages
  if (filters.languages && filters.languages.length > 0) {
    filters.languages.forEach((lang) => {
      queryParts.push(`language:${lang}`);
    });
  }

  // Stars
  if (filters.minStars && filters.maxStars) {
    queryParts.push(`stars:${filters.minStars}..${filters.maxStars}`);
  } else if (filters.minStars) {
    queryParts.push(`stars:>=${filters.minStars}`);
  } else if (filters.maxStars) {
    queryParts.push(`stars:<=${filters.maxStars}`);
  }

  // Forks
  if (filters.minForks && filters.maxForks) {
    queryParts.push(`forks:${filters.minForks}..${filters.maxForks}`);
  } else if (filters.minForks) {
    queryParts.push(`forks:>=${filters.minForks}`);
  } else if (filters.maxForks) {
    queryParts.push(`forks:<=${filters.maxForks}`);
  }

  // Good first issues
  if (filters.hasGoodFirstIssues) {
    queryParts.push('label:"good first issue"');
  }

  // Help wanted
  if (filters.hasHelpWanted) {
    queryParts.push('label:"help wanted"');
  }

  // Topics
  if (filters.topics && filters.topics.length > 0) {
    filters.topics.forEach((topic) => {
      queryParts.push(`topic:${topic}`);
    });
  }

  // License
  if (filters.licenses && filters.licenses.length > 0) {
    const licenseQuery = filters.licenses
      .map((license) => `license:${license}`)
      .join(" ");
    queryParts.push(`(${licenseQuery})`);
  }

  // Last pushed
  if (filters.lastPushedWithin) {
    const daysMap = {
      "7days": 7,
      "30days": 30,
      "90days": 90,
      "180days": 180,
      "365days": 365,
    };
    const days = daysMap[filters.lastPushedWithin];
    const date = new Date();
    date.setDate(date.getDate() - days);
    const dateStr = date.toISOString().split("T")[0];
    queryParts.push(`pushed:>=${dateStr}`);
  }

  // Activity level (based on last push)
  if (filters.activityLevel === "very_active") {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const dateStr = date.toISOString().split("T")[0];
    queryParts.push(`pushed:>=${dateStr}`);
  } else if (filters.activityLevel === "active") {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const dateStr = date.toISOString().split("T")[0];
    queryParts.push(`pushed:>=${dateStr}`);
  }

  // Project age (created date)
  if (filters.projectAge === "very_new") {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    const dateStr = date.toISOString().split("T")[0];
    queryParts.push(`created:>=${dateStr}`);
  } else if (filters.projectAge === "new") {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 2);
    const dateStr = date.toISOString().split("T")[0];
    queryParts.push(`created:>=${dateStr}`);
  } else if (filters.projectAge === "established") {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5);
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() - 2);
    queryParts.push(
      `created:${endDate.toISOString().split("T")[0]}..${startDate.toISOString().split("T")[0]}`,
    );
  } else if (filters.projectAge === "mature") {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 5);
    const dateStr = date.toISOString().split("T")[0];
    queryParts.push(`created:<=${dateStr}`);
  }

  // Always search for repositories with issues enabled
  queryParts.push("is:public");
  queryParts.push("archived:false");

  // If no query parts, search for all repos
  if (queryParts.length === 2) { // Only has is:public and archived:false
    queryParts.push("stars:>100");
  }

  return queryParts.join(" ");
}