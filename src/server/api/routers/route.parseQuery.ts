import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createTRPCRouter } from "~/server/api/trpc";
import { env } from "~/env";
import { SearchFiltersSchema, type SearchFiltersSchemaType } from "~/schema";
import { publicProcedure } from "../procedure";
import { TRPCError } from "@trpc/server";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const MAX_CHARS = 3000;

const SYSTEM_PROMPT = `You are an AI assistant specialized in parsing natural language queries for GitHub open source project searches. Your ONLY task is to extract filters from user queries and return them as structured JSON data.

CRITICAL RULES:
1. You MUST return ONLY valid JSON - no markdown, no explanations, no additional text
2. Extract filters ONLY from the user's query - do not invent or assume information
3. For any category not mentioned in the query, return an empty array [] or null
4. Do NOT try to do anything except parse the query into the specified JSON format

JSON FORMAT (return exactly this structure):
{
  "languages": string[],
  "frameworks": string[],
  "libraries": string[],
  "experienceLevel": "beginner" | "intermediate" | "advanced" | null,
  "yearsOfExperience": number | null,
  "projectAge": "very_new" | "new" | "established" | "mature" | null,
  "competitionLevel": "low" | "medium" | "high" | null,
  "activityLevel": "very_active" | "active" | "moderate" | "inactive" | null,
  "minStars": number | null,
  "maxStars": number | null,
  "minForks": number | null,
  "maxForks": number | null,
  "minContributors": number | null,
  "maxContributors": number | null,
  "hasGoodFirstIssues": boolean,
  "hasHelpWanted": boolean,
  "minOpenIssues": number | null,
  "issueTypes": string[],
  "maintainerResponsiveness": "high" | "medium" | "low" | "any",
  "hasMentor": boolean,
  "hasContributingGuide": boolean,
  "hasCodeOfConduct": boolean,
  "hasIssueTemplates": boolean,
  "isWelcoming": boolean,
  "topics": string[],
  "licenses": string[],
  "lastPushedWithin": "7days" | "30days" | "90days" | "180days" | "365days" | null
}

EXAMPLE 1:
Query: "I am looking for a React project for beginners with good first issues"
Response:
{
  "languages": [],
  "frameworks": ["React"],
  "libraries": [],
  "experienceLevel": "beginner",
  "yearsOfExperience": null,
  "projectAge": null,
  "competitionLevel": null,
  "activityLevel": null,
  "minStars": null,
  "maxStars": null,
  "minForks": null,
  "maxForks": null,
  "minContributors": null,
  "maxContributors": null,
  "hasGoodFirstIssues": true,
  "hasHelpWanted": false,
  "minOpenIssues": null,
  "issueTypes": [],
  "maintainerResponsiveness": "any",
  "hasMentor": false,
  "hasContributingGuide": false,
  "hasCodeOfConduct": false,
  "hasIssueTemplates": false,
  "isWelcoming": false,
  "topics": [],
  "licenses": [],
  "lastPushedWithin": null
}

EXAMPLE 2:
Query: "Looking for an actively maintained TypeScript and Next.js project with Prisma and tRPC, fairly new, has contributing guide and code of conduct, with at least 500 stars but less than 5000 stars, updated within last 30 days, suitable for intermediate developers with 2-3 years experience, low to medium competition, and MIT license"
Response:
{
  "languages": ["TypeScript"],
  "frameworks": ["Next.js"],
  "libraries": ["Prisma", "tRPC"],
  "experienceLevel": "intermediate",
  "yearsOfExperience": 2,
  "projectAge": "new",
  "competitionLevel": "low",
  "activityLevel": "active",
  "minStars": 500,
  "maxStars": 5000,
  "minForks": null,
  "maxForks": null,
  "minContributors": null,
  "maxContributors": null,
  "hasGoodFirstIssues": false,
  "hasHelpWanted": false,
  "minOpenIssues": null,
  "issueTypes": [],
  "maintainerResponsiveness": "any",
  "hasMentor": false,
  "hasContributingGuide": true,
  "hasCodeOfConduct": true,
  "hasIssueTemplates": false,
  "isWelcoming": false,
  "topics": [],
  "licenses": ["MIT"],
  "lastPushedWithin": "30days"
}

EXAMPLE 3:
Query: "I want to contribute to a Python machine learning project with help wanted issues, has mentor support, welcoming community, more than 1000 stars, actively maintained, suitable for beginners"
Response:
{
  "languages": ["Python"],
  "frameworks": [],
  "libraries": [],
  "experienceLevel": "beginner",
  "yearsOfExperience": null,
  "projectAge": null,
  "competitionLevel": null,
  "activityLevel": "active",
  "minStars": 1000,
  "maxStars": null,
  "minForks": null,
  "maxForks": null,
  "minContributors": null,
  "maxContributors": null,
  "hasGoodFirstIssues": false,
  "hasHelpWanted": true,
  "minOpenIssues": null,
  "issueTypes": [],
  "maintainerResponsiveness": "any",
  "hasMentor": true,
  "hasContributingGuide": false,
  "hasCodeOfConduct": false,
  "hasIssueTemplates": false,
  "isWelcoming": true,
  "topics": ["machine-learning"],
  "licenses": [],
  "lastPushedWithin": null
}

Now parse the following user query:`;

export const queryRouter = createTRPCRouter({
  parseQuery: publicProcedure
    .input(z.object({ query: z.string().min(1).max(MAX_CHARS) }))
    .mutation(async ({ input }) => {
      const charCount = input.query.length;
      if (charCount > MAX_CHARS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Query is too long. Maximum ${MAX_CHARS} characters allowed. You used ${charCount} characters.`,
          cause: { charCount, maxChars: MAX_CHARS },
        });
      }

      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash-lite",
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        });

        const result = await model.generateContent(
          `${SYSTEM_PROMPT}\n\nUser Query: ${input.query}`,
        );

        const response = result.response;
        const text = response.text();

        let filters;
        try {
          const cleanedText = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

          const parsed = JSON.parse(cleanedText) as SearchFiltersSchemaType;
          filters = SearchFiltersSchema.parse(parsed);
        } catch (error) {
          console.error("Failed to parse Gemini response:");
          console.error("text: ", text);
          console.error("error: ", error);
          throw new Error("Failed to parse AI response");
        }

        return {
          filters,
          summary: input.query,
        };
      } catch (error) {
        console.error("Error parsing query:", error);
        throw new Error("Failed to parse query");
      }
    }),
});
