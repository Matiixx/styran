import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import postRouter from "./routers/post";
import userRouter from "./routers/user";

export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
