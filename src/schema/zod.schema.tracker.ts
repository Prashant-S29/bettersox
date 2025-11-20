// src/schema/tracker.schema.ts
import { z } from "zod";
import { TRACKABLE_EVENTS } from "~/types/types.tracker";
import { TRACKER_CONFIG } from "~/constants";

const githubUrlRegex =
  /^https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/;

export const createTrackerSchema = z.object({
  repoUrl: z.string().url().regex(githubUrlRegex, {
    message:
      "must be a valid github repository url (e.g., https://github.com/owner/repo)",
  }),
  trackedEvents: z
    .array(z.enum(Object.values(TRACKABLE_EVENTS) as [string, ...string[]]))
    .min(1, "select at least one event to track")
    .max(
      TRACKER_CONFIG.MAX_TRACKED_EVENTS,
      `maximum ${TRACKER_CONFIG.MAX_TRACKED_EVENTS} events allowed`,
    )
    .refine((events) => new Set(events).size === events.length, {
      message: "duplicate events are not allowed",
    }),
  enableAiSummary: z.boolean().default(false),
  prTrackBranch: z.string().optional(),
});

export type CreateTrackerInput = z.infer<typeof createTrackerSchema>;

export const updateTrackerSchema = z.object({
  trackedEvents: z
    .array(z.enum(Object.values(TRACKABLE_EVENTS) as [string, ...string[]]))
    .min(1)
    .max(TRACKER_CONFIG.MAX_TRACKED_EVENTS)
    .optional(),
  enableAiSummary: z.boolean().optional(),
  prTrackBranch: z.string().optional(),
  isPaused: z.boolean().optional(),
});

export type UpdateTrackerInput = z.infer<typeof updateTrackerSchema>;

export function parseGitHubUrl(
  url: string,
): { owner: string; name: string } | null {
  const match = githubUrlRegex.exec(url);
  if (!match) return null;
  const [, owner, name] = match;
  return { owner: owner!, name: name! };
}
