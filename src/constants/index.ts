type FeatureFlag = {
  enabled: boolean;
  beta: boolean;
  experimental: boolean;
  href: string;
  label: string;
  isNew?: boolean;
};

export const MAX_USER_QUERY_LENGTH = 5000;

export const LOGO =
  "https://9jb1v1y2ig.ufs.sh/f/091oe9IncF3wAwJGx7z45D9ifEGN28PyqYMKVnIQudZhTX3C";

export const TRACKER_CONFIG = {
  POLL_INTERVAL_MINUTES: 5,
  ACTIVITY_CHECK_LOOKBACK: 30,
  MAX_ERROR_COUNT: 10,
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
    enabled: true,
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
