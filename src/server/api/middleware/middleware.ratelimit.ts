import { TRPCError } from "@trpc/server";
import type { Ratelimit } from "@upstash/ratelimit";
import { getUserIdentifier } from "~/lib/rate-limit/limiter";
import { middleware } from "../trpc";

/**
 * Create rate limit middleware that can be used with any procedure
 */
export function createRateLimitMiddleware(limiter: Ratelimit) {
  return middleware(async ({ ctx, next }) => {
    const identifier = getUserIdentifier(
      ctx.session?.user?.id,
      ctx.headers.get("x-forwarded-for") ?? undefined,
    );

    // Check rate limit
    const { success, limit, remaining, reset } =
      await limiter.limit(identifier);

    if (!success) {
      const resetDate = new Date(reset);
      const retryAfter = Math.ceil((resetDate.getTime() - Date.now()) / 1000);

      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        cause: {
          limit,
          remaining,
          reset: resetDate.toISOString(),
          retryAfter,
        },
      });
    }

    return next();
  });
}
