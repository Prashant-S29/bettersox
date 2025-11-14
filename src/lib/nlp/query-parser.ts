import type { SearchFilters, ParsedQuery, ExtractedMatch } from "~/types";
import { allPatterns } from "./patterns";

export class QueryParser {
  parse(query: string): ParsedQuery {
    const matches = this.extractMatches(query);
    const filters = this.buildPartialFilters(matches);
    const confidence = matches.length > 0 ? 1 : 0;

    return {
      originalQuery: query,
      filters,
      matches,
      confidence,
    };
  }

  private extractMatches(query: string): ExtractedMatch[] {
    const matches: ExtractedMatch[] = [];
    const processedRanges = new Set<string>();

    for (const pattern of allPatterns) {
      pattern.regex.lastIndex = 0;

      let match: RegExpExecArray | null;
      while ((match = pattern.regex.exec(query)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const rangeKey = `${start}-${end}`;

        if (processedRanges.has(rangeKey)) {
          continue;
        }

        const value = pattern.valueExtractor
          ? pattern.valueExtractor(match[0])
          : match[0];

        matches.push({
          text: match[0],
          category: pattern.category,
          start,
          end,
          value,
        });

        processedRanges.add(rangeKey);
      }
    }

    return matches.sort((a, b) => a.start - b.start);
  }

  private buildPartialFilters(
    matches: ExtractedMatch[],
  ): Partial<SearchFilters> {
    const filters: Partial<SearchFilters> = {
      languages: [],
      frameworks: [],
      libraries: [],
    };

    for (const match of matches) {
      if (match.category === "language" && filters.languages) {
        filters.languages.push(match.text);
      } else if (match.category === "framework" && filters.frameworks) {
        filters.frameworks.push(match.text);
      } else if (match.category === "library" && filters.libraries) {
        filters.libraries.push(match.text);
      }
    }

    return filters;
  }

  getDetectedCategories(matches: ExtractedMatch[]): Set<string> {
    const uiCategories = new Set<string>();

    for (const match of matches) {
      switch (match.category) {
        case "language":
        case "framework":
        case "library":
          uiCategories.add("languages");
          break;
        case "stars":
          uiCategories.add("stars");
          break;
        case "contributors":
          uiCategories.add("contributors");
          break;
        case "experience":
          uiCategories.add("experience");
          break;
        case "activity":
          uiCategories.add("activity");
          break;
        case "issue":
          uiCategories.add("issue");
          break;
      }
    }

    return uiCategories;
  }
}

// Export singleton instance
export const queryParser = new QueryParser();
