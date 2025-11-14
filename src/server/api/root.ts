import { queryRouter } from "~/server/api/routers/parse-query";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { searchRouter } from "./routers/search";

export const appRouter = createTRPCRouter({
  query: queryRouter,
   search: searchRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
