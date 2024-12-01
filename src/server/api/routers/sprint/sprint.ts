import { z } from "zod";
import { TRPCError, type inferRouterOutputs } from "@trpc/server";

import { editProjectSchema, newProjectSchema } from "~/lib/schemas";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const sprintRouter = createTRPCRouter({});

export type SprintRouterOutput = inferRouterOutputs<typeof sprintRouter>;

export default sprintRouter;
