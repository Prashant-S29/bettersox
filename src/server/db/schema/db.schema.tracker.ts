import {
  pgTable,
  varchar,
  uuid,
  timestamp,
  boolean,
  integer,
  jsonb,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./db.schema.user";
import type { RepoActivityData } from "~/types/github";

// tracked repositories (one per user)
export const trackedRepos = pgTable(
  "tracked_repos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // repository info
    repoOwner: varchar("repo_owner", { length: 255 }).notNull(),
    repoName: varchar("repo_name", { length: 255 }).notNull(),
    repoFullName: varchar("repo_full_name", { length: 511 }).notNull(),
    repoUrl: text("repo_url").notNull(),

    // tracking configuration
    trackedEvents: jsonb("tracked_events").$type<string[]>().notNull(),
    enableAiSummary: boolean("enable_ai_summary").default(false).notNull(),

    // event-specific configs
    prTrackBranch: varchar("pr_track_branch", { length: 255 }),

    // activity tracking
    lastCheckedAt: timestamp("last_checked_at").defaultNow().notNull(),
    lastActivitySignature: varchar("last_activity_signature", { length: 64 }),
    lastActivityData: jsonb("last_activity_data").$type<RepoActivityData>(),

    // status
    isActive: boolean("is_active").default(true).notNull(),
    isPaused: boolean("is_paused").default(false).notNull(),
    errorCount: integer("error_count").default(0).notNull(),
    lastError: text("last_error"),

    // timestamps
    trackedSince: timestamp("tracked_since").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_tracked_repos_user_id_unique").on(table.userId),
    index("idx_tracked_repos_is_active").on(table.isActive),
    index("idx_tracked_repos_last_checked").on(table.lastCheckedAt),
  ],
);

// events log (for debugging and analytics)
export const eventsLog = pgTable(
  "events_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trackedRepoId: uuid("tracked_repo_id")
      .notNull()
      .references(() => trackedRepos.id, { onDelete: "cascade" }),

    // event details
    eventType: varchar("event_type", { length: 50 }).notNull(),
    eventData: jsonb("event_data").$type<Record<string, unknown>>().notNull(),
    eventSignature: varchar("event_signature", { length: 64 }).notNull(),

    // processing
    detectedAt: timestamp("detected_at").defaultNow().notNull(),
    notifiedAt: timestamp("notified_at"),
    notificationSent: boolean("notification_sent").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    trackedRepoIdx: index("idx_events_log_tracked_repo").on(
      table.trackedRepoId,
    ),
    detectedAtIdx: index("idx_events_log_detected_at").on(table.detectedAt),
    notifiedIdx: index("idx_events_log_notified").on(
      table.notificationSent,
      table.notifiedAt,
    ),
  }),
);

// relations
export const trackedReposRelations = relations(
  trackedRepos,
  ({ one, many }) => ({
    user: one(user, {
      fields: [trackedRepos.userId],
      references: [user.id],
    }),
    events: many(eventsLog),
  }),
);

export const eventsLogRelations = relations(eventsLog, ({ one }) => ({
  trackedRepo: one(trackedRepos, {
    fields: [eventsLog.trackedRepoId],
    references: [trackedRepos.id],
  }),
}));