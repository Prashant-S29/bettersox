import { t } from "../trpc";
import { TRPCError } from "@trpc/server";

export const protectedMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to do that",
    });
  }

  const result = await next();

  return result;
});
