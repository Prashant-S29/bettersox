type FeatureFlag = {
  enabled: boolean;
  beta: boolean;
  experimental: boolean;
  href: string;
  label: string;
  isNew?: boolean;
};

// Tracker Configuration

export const TRACKER_CONFIG = {
  // Check for activity changes every 5 minutes
  POLL_INTERVAL_MINUTES: 5,

  // Look back 30 minutes for new events (increased from default)
  ACTIVITY_CHECK_LOOKBACK: 30,

  // Maximum error count before deactivating tracker
  MAX_ERROR_COUNT: 10,

  // Batch size for processing trackers
  BATCH_SIZE: 5,
} as const;

export const featureFlags: Record<string, FeatureFlag> = {
  nlpSearch: {
    enabled: true,
    beta: false,
    experimental: false,
    isNew: true,
    href: "/match",
    label: "Match",
  },
  profile: {
    enabled: true,
    beta: false,
    experimental: false,
    href: "/profile",
    label: "Profile",
  },
  track: {
    enabled: true, // Enable the track feature
    beta: false,
    experimental: false,
    isNew: true,
    href: "/track",
    label: "Track a Repo",
  },
  bookmarks: {
    enabled: true,
    beta: false,
    experimental: false,
    href: "/bookmarks",
    label: "Bookmarks",
  },
};

export const getNavItems = () => {
  return Object.values(featureFlags);
};

export const protectedRoutes = ["/track/new"];
