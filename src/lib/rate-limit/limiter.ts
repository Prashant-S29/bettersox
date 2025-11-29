import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "~/env";

// Initialize Redis client
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Rate limiters for different endpoints
 */

// Parse Query: 5 requests per minute
export const parseQueryLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:parse-query",
});

// Parse Resume: 3 requests per minute
export const parseResumeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "ratelimit:parse-resume",
});

// General API: 10 requests per minute
export const generalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:general",
});

// Search API: 10 requests per minute
export const searchLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:search",
});

/**
 * Get user identifier from session or IP
 */
export function getUserIdentifier(userId?: string, ip?: string): string {
  return userId ?? ip ?? "anonymous";
}
