import { eq } from "drizzle-orm";
import { createTRPCRouter } from "~/server/api/trpc";
import { protectedProcedure } from "~/server/api/procedure";
import { trackedRepos, eventsLog } from "~/server/db/schema/db.schema.tracker";
import {
  createTrackerSchema,
  updateTrackerSchema,
  parseGitHubUrl,
} from "~/schema/zod.schema.tracker";
import { verifyRepo, getRepoActivity } from "~/lib/github/queries";
import { generateActivitySignature } from "~/lib/tracking/signature";
import { TRACKER_CONFIG } from "~/constants";

export const trackerRouter = createTRPCRouter({
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

        // verify repository exists and is public
        try {
          const verification = await verifyRepo(owner, name);

          if (verification.repository.isPrivate) {
            return {
              data: null,
              error: "private_repo",
              message: "cannot track private repositories",
            };
          }

          if (verification.repository.isArchived) {
            return {
              data: null,
              error: "archived_repo",
              message: "cannot track archived repositories",
            };
          }
        } catch (error) {
          console.error("[tracker] create error:", error);
          return {
            data: null,
            error: "not_found",
            message: "repository not found",
          };
        }

        // enforce max events limit (backend validation)
        const trackedEvents = input.trackedEvents.slice(
          0,
          TRACKER_CONFIG.MAX_TRACKED_EVENTS,
        );

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
            prTrackBranch: input.prTrackBranch,
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

  // switch to a different repository
  switch: protectedProcedure
    .input(createTrackerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // get existing tracker
        const existingTracker = await ctx.db.query.trackedRepos.findFirst({
          where: eq(trackedRepos.userId, ctx.session.user.id),
        });

        if (!existingTracker) {
          return {
            data: null,
            error: "not_found",
            message: "no existing tracker found",
          };
        }

        // parse new github url
        const parsed = parseGitHubUrl(input.repoUrl);
        if (!parsed) {
          return {
            data: null,
            error: "invalid_url",
            message: "invalid github repository url",
          };
        }

        const { owner, name } = parsed;

        // verify new repository
        try {
          const verification = await verifyRepo(owner, name);

          if (verification.repository.isPrivate) {
            return {
              data: null,
              error: "private_repo",
              message: "cannot track private repositories",
            };
          }

          if (verification.repository.isArchived) {
            return {
              data: null,
              error: "archived_repo",
              message: "cannot track archived repositories",
            };
          }
        } catch (error) {
          console.error("[tracker] switch error:", error);
          return {
            data: null,
            error: "not_found",
            message: "repository not found",
          };
          // if (error.message.includes("Could not resolve to a Repository")) {
          // return {
          //   data: null,
          //   error: "not_found",
          //   message: "repository not found",
          // };
          // }
          // throw error;
        }

        // enforce max events limit
        const trackedEvents = input.trackedEvents.slice(
          0,
          TRACKER_CONFIG.MAX_TRACKED_EVENTS,
        );

        // fetch initial activity data for new repo
        const activityData = await getRepoActivity(owner, name);
        const initialSignature = generateActivitySignature(activityData);

        // update tracker
        const [updatedTracker] = await ctx.db
          .update(trackedRepos)
          .set({
            repoOwner: owner,
            repoName: name,
            repoFullName: `${owner}/${name}`,
            repoUrl: input.repoUrl,
            trackedEvents,
            enableAiSummary: input.enableAiSummary,
            prTrackBranch: input.prTrackBranch,
            lastActivitySignature: initialSignature,
            lastActivityData: activityData,
            lastCheckedAt: new Date(),
            errorCount: 0,
            lastError: null,
            updatedAt: new Date(),
          })
          .where(eq(trackedRepos.id, existingTracker.id))
          .returning();

        return {
          data: updatedTracker,
          error: null,
          message: "tracker switched successfully",
        };
      } catch (error) {
        console.error("[tracker] switch error:", error);
        return {
          data: null,
          error: "failed to switch tracker",
          message: "error switching tracker",
        };
      }
    }),

  // update tracker preferences
  update: protectedProcedure
    .input(updateTrackerSchema)
    .mutation(async ({ ctx, input }) => {
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

        // enforce max events limit if updating events
        const trackedEvents = input.trackedEvents
          ? input.trackedEvents.slice(0, TRACKER_CONFIG.MAX_TRACKED_EVENTS)
          : undefined;

        const [updatedTracker] = await ctx.db
          .update(trackedRepos)
          .set({
            ...input,
            trackedEvents: trackedEvents ?? existingTracker.trackedEvents,
            updatedAt: new Date(),
          })
          .where(eq(trackedRepos.id, existingTracker.id))
          .returning();

        return {
          data: updatedTracker,
          error: null,
          message: "tracker updated successfully",
        };
      } catch (error) {
        console.error("[tracker] update error:", error);
        return {
          data: null,
          error: "failed to update tracker",
          message: "error updating tracker",
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
