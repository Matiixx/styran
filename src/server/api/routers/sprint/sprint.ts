import { z } from "zod";
import { TRPCError, type inferRouterOutputs } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { StartSprintSchema } from "~/lib/schemas/sprintSchemas";
import { startOfDay } from "date-fns";
import { UTCDate } from "@date-fns/utc";

const sprintRouter = createTRPCRouter({
  startSprint: protectedProcedure
    .input(StartSprintSchema.extend({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const parsedInput = {
        ...input,
        startDate: new UTCDate(startOfDay(input.startDate)),
        endDate: new UTCDate(startOfDay(input.endDate)),
      };

      if (parsedInput.includeTasksFromBacklog) {
        const freeTaskIds = await ctx.db.task.findMany({
          where: { projectId: parsedInput.projectId, sprintId: null },
          select: { id: true },
        });

        const sprint = ctx.db.sprint
          .create({
            data: {
              name: parsedInput.name,
              goal: parsedInput.goal,
              startAt: parsedInput.startDate,
              endAt: parsedInput.endDate,
              project: {
                connect: {
                  id: parsedInput.projectId,
                  sprint: { none: { isActive: true } },
                },
              },
              tasks: {
                connect: freeTaskIds.map((taskId) => ({ id: taskId.id })),
              },
            },
          })
          .catch(() => {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Some sprint is already active",
            });
          });

        return sprint;
      } else {
        const sprint = ctx.db.sprint
          .create({
            data: {
              name: parsedInput.name,
              goal: parsedInput.goal,
              startAt: parsedInput.startDate,
              endAt: parsedInput.endDate,
              project: {
                connect: {
                  id: parsedInput.projectId,
                  sprint: { none: { isActive: true } },
                },
              },
            },
          })
          .catch(() => {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Some sprint is already active",
            });
          });

        return sprint;
      }
    }),
});

export type SprintRouterOutput = inferRouterOutputs<typeof sprintRouter>;

export default sprintRouter;
