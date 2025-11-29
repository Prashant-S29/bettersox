import {
  parseQueryLimiter,
  parseResumeLimiter,
  generalLimiter,
  searchLimiter,
} from "~/lib/rate-limit/limiter";
import { createRateLimitMiddleware } from "../middleware";
import { publicProcedure } from "./procedure.public";
import { protectedProcedure } from "./procedure.protected";

// middleware
const parseQueryRateLimit = createRateLimitMiddleware(parseQueryLimiter);
const parseResumeRateLimit = createRateLimitMiddleware(parseResumeLimiter);
const generalRateLimit = createRateLimitMiddleware(generalLimiter);
const searchRateLimit = createRateLimitMiddleware(searchLimiter);

// rate limit on public procedures
export const parseQueryProcedure = publicProcedure.use(parseQueryRateLimit);
export const parseResumeProcedure = publicProcedure.use(parseResumeRateLimit);
export const generalProcedure = publicProcedure.use(generalRateLimit);
export const searchProcedure = publicProcedure.use(searchRateLimit);

// rate limit on protected procedures
export const parseQueryProtectedProcedure =
  protectedProcedure.use(parseQueryRateLimit);
export const parseResumeProtectedProcedure =
  protectedProcedure.use(parseResumeRateLimit);
export const generalProtectedProcedure =
  protectedProcedure.use(generalRateLimit);
export const searchProtectedProcedure = protectedProcedure.use(searchRateLimit);
export const trackerProcedure = protectedProcedure.use(generalRateLimit);
