import type { SearchFilters } from "~/types";

export function buildGitHubSearchQuery(filters: SearchFilters): string {
  const queryParts: string[] = [];

  // Base filters
  queryParts.push("is:public");
  queryParts.push("archived:false");

  // Languages - use language: prefix
  if (filters.languages && filters.languages.length > 0) {
    filters.languages.forEach((lang) => {
      queryParts.push(`language:${lang}`);
    });
  }

  // Frameworks - use topic: prefix
  if (filters.frameworks && filters.frameworks.length > 0) {
    filters.frameworks.forEach((framework) => {
      // Convert framework names to lowercase and replace spaces/dots
      const topicName = framework
        .toLowerCase()
        .replace(/\./g, "")
        .replace(/\s+/g, "-");
      queryParts.push(`topic:${topicName}`);
    });
  }

  // Libraries - use topic: prefix
  if (filters.libraries && filters.libraries.length > 0) {
    filters.libraries.forEach((library) => {
      const topicName = library
        .toLowerCase()
        .replace(/\./g, "")
        .replace(/\s+/g, "-");
      queryParts.push(`topic:${topicName}`);
    });
  }

  // Additional topics
  if (filters.topics && filters.topics.length > 0) {
    filters.topics.forEach((topic) => {
      const topicName = topic
        .toLowerCase()
        .replace(/\./g, "")
        .replace(/\s+/g, "-");
      queryParts.push(`topic:${topicName}`);
    });
  }

  // Stars
  if (filters.minStars !== null && filters.minStars !== undefined) {
    if (filters.maxStars !== null && filters.maxStars !== undefined) {
      queryParts.push(`stars:${filters.minStars}..${filters.maxStars}`);
    } else {
      queryParts.push(`stars:>=${filters.minStars}`);
    }
  } else if (filters.maxStars !== null && filters.maxStars !== undefined) {
    queryParts.push(`stars:<=${filters.maxStars}`);
  } else {
    // Default minimum stars
    queryParts.push("stars:>100");
  }

  // Forks
  if (filters.minForks !== null && filters.minForks !== undefined) {
    if (filters.maxForks !== null && filters.maxForks !== undefined) {
      queryParts.push(`forks:${filters.minForks}..${filters.maxForks}`);
    } else {
      queryParts.push(`forks:>=${filters.minForks}`);
    }
  } else if (filters.maxForks !== null && filters.maxForks !== undefined) {
    queryParts.push(`forks:<=${filters.maxForks}`);
  }

  // NOTE: GitHub doesn't support label: syntax for repository search
  // Good first issues and help wanted are checked after fetching repos
  // We'll rely on the GraphQL query to check hasGoodFirstIssues field

  // Last pushed within
  if (filters.lastPushedWithin) {
    const dateMap: Record<string, string> = {
      "7days": "7",
      "30days": "30",
      "90days": "90",
      "180days": "180",
      "365days": "365",
    };
    const days = dateMap[filters.lastPushedWithin];
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      queryParts.push(`pushed:>=${dateStr}`);
    }
  }

  // License
  if (filters.licenses && filters.licenses.length > 0) {
    // GitHub uses license: keyword for exact match
    filters.licenses.forEach((license) => {
      queryParts.push(`license:${license.toLowerCase()}`);
    });
  }

  // Project age (created date)
  if (filters.projectAge) {
    const now = new Date();
    let dateThreshold: Date;

    switch (filters.projectAge) {
      case "very_new": // < 6 months
        dateThreshold = new Date(now.setMonth(now.getMonth() - 6));
        queryParts.push(
          `created:>=${dateThreshold.toISOString().split("T")[0]}`,
        );
        break;
      case "new": // 6 months - 2 years
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        queryParts.push(
          `created:${twoYearsAgo.toISOString().split("T")[0]}..${sixMonthsAgo.toISOString().split("T")[0]}`,
        );
        break;
      case "established": // 2-5 years
        const twoYears = new Date();
        twoYears.setFullYear(twoYears.getFullYear() - 2);
        const fiveYears = new Date();
        fiveYears.setFullYear(fiveYears.getFullYear() - 5);
        queryParts.push(
          `created:${fiveYears.toISOString().split("T")[0]}..${twoYears.toISOString().split("T")[0]}`,
        );
        break;
      case "mature": // > 5 years
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        queryParts.push(
          `created:<=${fiveYearsAgo.toISOString().split("T")[0]}`,
        );
        break;
    }
  }

  const query = queryParts.join(" ");
  return query;
}
