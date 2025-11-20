import { t } from "../trpc";

import { timingMiddleware } from "../middleware";

export const publicProcedure = t.procedure.use(timingMiddleware);
