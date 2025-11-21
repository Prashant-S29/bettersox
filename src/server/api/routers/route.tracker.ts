// src/server/api/routers/route.tracker.ts
import { eq } from "drizzle-orm";
import { createTRPCRouter } from "~/server/api/trpc";
import { protectedProcedure, publicProcedure } from "~/server/api/procedure";
import { trackedRepos, eventsLog } from "~/server/db/schema/db.schema.tracker";
import {
  createTrackerSchema,
  // updateTrackerSchema,
  parseGitHubUrl,
  verifyRepoSchema,
  type CreateTrackerInput,
} from "~/schema/zod.schema.tracker";
import { getRepoActivity, getRepoMetadata } from "~/lib/github/queries";
import { generateActivitySignature } from "~/lib/tracking/signature";

function serializeEventConfig(input: CreateTrackerInput): string[] {
  const events: string[] = [];

  // pull requests
  if (input.prEvent !== "none") {
    if (input.prEvent === "pr_merged_to_branch" && input.prTargetBranch) {
      events.push(`${input.prEvent}:${input.prTargetBranch}`);
    } else {
      events.push(input.prEvent);
    }
  }

  // issues
  if (input.issueEvent !== "none") {
    if (
      (input.issueEvent === "new_issue_with_tag" ||
        input.issueEvent === "new_issue_with_custom_tag") &&
      input.issueTag
    ) {
      events.push(`${input.issueEvent}:${input.issueTag}`);
    } else {
      events.push(input.issueEvent);
    }
  }

  // additional options
  if (input.trackNewContributor) {
    events.push("new_contributor");
  }
  if (input.trackNewFork) {
    events.push("new_fork");
  }
  if (input.trackNewRelease) {
    events.push("new_release");
  }

  return events;
}

export const trackerRouter = createTRPCRouter({
  // verify and get repo metadata
  verifyRepo: publicProcedure
    .input(verifyRepoSchema)
    .query(async ({ input }) => {
      try {
        const parsed = parseGitHubUrl(input.repoUrl);
        if (!parsed) {
          return {
            data: null,
            error: "invalid_url",
            message: "invalid github repository url",
          };
        }

        const { owner, name } = parsed;

        try {
          const metadata = await getRepoMetadata(owner, name);

          if (metadata.isPrivate) {
            return {
              data: null,
              error: "private_repo",
              message: "cannot track private repositories",
            };
          }

          if (metadata.isArchived) {
            return {
              data: null,
              error: "archived_repo",
              message: "cannot track archived repositories",
            };
          }

          return {
            data: metadata,
            error: null,
            message: "repository verified successfully",
          };
        } catch (error) {
          console.error("[tracker] verify repo error:", error);
          return {
            data: null,
            error: "not_found",
            message: "repository not found or unable to access",
          };
        }
      } catch (error) {
        console.error("[tracker] verify repo error:", error);
        return {
          data: null,
          error: "unknown_error",
          message: "failed to verify repository",
        };
      }
    }),

  // get user's current tracker metadata
  getTrackerMetadata: protectedProcedure.query(async ({ ctx }) => {
    try {
      const tracker = await ctx.db.query.trackedRepos.findFirst({
        where: eq(trackedRepos.userId, ctx.session.user.id),
        columns: {
          id: true,
          userId: true,
          repoFullName:true,
          repoUrl: true,
          repoOwner: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        data: tracker ?? null,
        error: null,
        message: tracker ? "tracker found" : "no tracker found",
      };
    } catch (error) {
      console.error("[tracker] get tracker error:", error);
      return {
        data: null,
        error: "failed to fetch tracker",
        message: "error fetching tracker",
      };
    }
  }),

  // get user's current tracker
  getTracker: protectedProcedure.query(async ({ ctx }) => {
    try {
      const tracker = await ctx.db.query.trackedRepos.findFirst({
        where: eq(trackedRepos.userId, ctx.session.user.id),
      });

      return {
        data: tracker ?? null,
        error: null,
        message: tracker ? "tracker found" : "no tracker found",
      };
    } catch (error) {
      console.error("[tracker] get tracker error:", error);
      return {
        data: null,
        error: "failed to fetch tracker",
        message: "error fetching tracker",
      };
    }
  }),

  // create a new tracker
  create: protectedProcedure
    .input(createTrackerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // check if user already has a tracker
        const existingTracker = await ctx.db.query.trackedRepos.findFirst({
          where: eq(trackedRepos.userId, ctx.session.user.id),
        });

        if (existingTracker) {
          return {
            data: null,
            error: "conflict",
            message: `you already have a tracker for ${existingTracker.repoFullName}. delete it first or use the switch endpoint.`,
          };
        }

        // parse github url
        const parsed = parseGitHubUrl(input.repoUrl);
        if (!parsed) {
          return {
            data: null,
            error: "invalid_url",
            message: "invalid github repository url",
          };
        }

        const { owner, name } = parsed;

        // serialize event config
        const trackedEvents = serializeEventConfig(input);

        if (trackedEvents.length === 0) {
          return {
            data: null,
            error: "no_events",
            message: "please select at least one event to track",
          };
        }

        if (trackedEvents.length > 4) {
          return {
            data: null,
            error: "too_many_events",
            message: "maximum 4 events allowed",
          };
        }

        // fetch initial activity data
        const activityData = await getRepoActivity(owner, name);
        const initialSignature = generateActivitySignature(activityData);

        // create tracker
        const [newTracker] = await ctx.db
          .insert(trackedRepos)
          .values({
            userId: ctx.session.user.id,
            repoOwner: owner,
            repoName: name,
            repoFullName: `${owner}/${name}`,
            repoUrl: input.repoUrl,
            trackedEvents,
            enableAiSummary: input.enableAiSummary,
            prTrackBranch: input.prTargetBranch,
            lastActivitySignature: initialSignature,
            lastActivityData: activityData,
            lastCheckedAt: new Date(),
          })
          .returning();

        return {
          data: newTracker,
          error: null,
          message: "tracker created successfully",
        };
      } catch (error) {
        console.error("[tracker] create error:", error);
        return {
          data: null,
          error: "failed to create tracker",
          message: "error creating tracker",
        };
      }
    }),

  // delete tracker
  delete: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const existingTracker = await ctx.db.query.trackedRepos.findFirst({
        where: eq(trackedRepos.userId, ctx.session.user.id),
      });

      if (!existingTracker) {
        return {
          data: null,
          error: "not_found",
          message: "no tracker found",
        };
      }

      await ctx.db
        .delete(trackedRepos)
        .where(eq(trackedRepos.id, existingTracker.id));

      return {
        data: { success: true },
        error: null,
        message: "tracker deleted successfully",
      };
    } catch (error) {
      console.error("[tracker] delete error:", error);
      return {
        data: null,
        error: "failed to delete tracker",
        message: "error deleting tracker",
      };
    }
  }),

  // get tracker statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const tracker = await ctx.db.query.trackedRepos.findFirst({
        where: eq(trackedRepos.userId, ctx.session.user.id),
      });

      if (!tracker) {
        return {
          data: null,
          error: null,
          message: "no tracker found",
        };
      }

      // count events logged
      const eventCount = await ctx.db
        .select()
        .from(eventsLog)
        .where(eq(eventsLog.trackedRepoId, tracker.id));

      return {
        data: {
          tracker,
          totalEvents: eventCount.length,
          trackedSince: tracker.trackedSince,
        },
        error: null,
        message: "stats fetched successfully",
      };
    } catch (error) {
      console.error("[tracker] get stats error:", error);
      return {
        data: null,
        error: "failed to fetch stats",
        message: "error fetching stats",
      };
    }
  }),
});
