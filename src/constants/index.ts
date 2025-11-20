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
  MAX_TRACKERS_PER_USER: 1,
  MAX_TRACKED_EVENTS: 4,
  POLLING_INTERVAL: 5 * 60 * 1000, // 5 minutes in ms
  ACTIVITY_CHECK_LOOKBACK: 10, // Check events from last 10 minutes
} as const;

export const featureFlags: Record<string, FeatureFlag> = {
  nlpSearch: {
    enabled: true,
    beta: false,
    experimental: false,
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