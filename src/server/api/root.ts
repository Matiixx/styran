import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import postRouter from "./routers/post";
import userRouter from "./routers/user";
import projectsRouter from "./routers/projects";
import tasksRouter from "./routers/tasks";

export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
