import { queryRouter } from "~/server/api/routers/route.parseQuery";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { searchRouter } from "./routers/route.search";
import { resumeParserRouter } from "./routers/route.resumeParser";
import { matchRouter } from "./routers/route.match";
import { trackerRouter } from "./routers/route.tracker";

export const appRouter = createTRPCRouter({
  query: queryRouter,
  search: searchRouter,
  resumeParser: resumeParserRouter,
  match: matchRouter,
  tracker: trackerRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
