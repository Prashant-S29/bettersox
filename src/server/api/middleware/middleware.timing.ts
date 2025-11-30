import { t } from "../trpc";

export const timingMiddleware = t.middleware(async ({ next }) => {
  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  return result;
});
