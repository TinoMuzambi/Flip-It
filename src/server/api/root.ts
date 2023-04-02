import { createTRPCRouter } from "~/server/api/trpc";

import { flippersRouter } from "./routers/flippers";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  flippers: flippersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
