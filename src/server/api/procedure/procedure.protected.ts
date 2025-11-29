import { t } from "../trpc";

import { protectedMiddleware } from "../middleware";
import { TRPCError } from "@trpc/server";

export const protectedProcedure = t.procedure
  .use(protectedMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
