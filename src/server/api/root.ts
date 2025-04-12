import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import postRouter from "./routers/post";
import userRouter from "./routers/user";
import projectsRouter from "./routers/projects";
import tasksRouter from "./routers/tasks";
import sprintRouter from "./routers/sprint";
import taskCommentsRouter from "./routers/taskComments";
import timeTrackerRouter from "./routers/timeTracker";
import integrationsRouter from "./routers/integrations";

export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  sprint: sprintRouter,
  taskComments: taskCommentsRouter,
  timeTracker: timeTrackerRouter,
  integrations: integrationsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
