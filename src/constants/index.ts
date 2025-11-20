type FeatureFlag = {
  enabled: boolean;
  beta: boolean;
  experimental: boolean;
  href: string;
  label: string;
  isNew?: boolean;
};

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
    enabled: false,
    beta: false,
    experimental: false,
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
