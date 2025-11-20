import { t } from "../trpc";

import { protectedMiddleware } from "../middleware";

export const protectedProcedure = t.procedure.use(protectedMiddleware);
